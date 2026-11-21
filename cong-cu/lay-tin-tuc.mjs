// Lấy bản tin từ Google Sheet "Bản tin nhanh" (Sheet1: tin; DanhGia: đánh giá của tác vụ AI; LĐ; LichHop; Chidao),
// lọc tin 60 ngày gần đây, khóa bằng "mật khẩu xem" (AES-GCM 256, PBKDF2-SHA256 250000 vòng – đúng khuôn dạng của app)
// rồi ghi tin-tuc.mahoa.json để Phần 9 – Thông tin truyền thông và Lịch họp đọc.
//
// Dùng:  SHEET_TIN_TUC_ID=... MAT_KHAU_XEM=... node cong-cu/lay-tin-tuc.mjs tin-tuc.mahoa.json
// Sheet phải chia sẻ "Bất kỳ ai có đường liên kết – Người xem" (đọc qua địa chỉ xuất CSV của Google Sheets).
// Thử trên máy không cần mạng: NGUON_CSV=<thư mục có Sheet1.csv, DanhGia.csv, LĐ.csv, LichHop.csv, Chidao.csv>.
// Nội dung không đổi (bỏ qua giờ cập nhật) thì không ghi lại tệp, in "KHONG-DOI".
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { DS_DON_VI, dvLienQuan, layGoc, khoaDonVi, ghiNeuDoi } from './don-vi.mjs';

const LAP = 250000, SO_NGAY = Number(process.env.SO_NGAY_TIN || 60), TOI_DA = 4000;
const [, , ra] = process.argv;
const ID = (process.env.SHEET_TIN_TUC_ID || '').trim(), mk = process.env.MAT_KHAU_XEM || '', NGUON = process.env.NGUON_CSV || '';
if (!ra) { console.error('Thiếu tham số: <tệp-ra>'); process.exit(2); }
if (!ID && !NGUON) { console.error('Chưa có SHEET_TIN_TUC_ID (mã của Google Sheet "Bản tin nhanh").'); process.exit(2); }
if (mk.length < 8) { console.error('Chưa có MAT_KHAU_XEM (hoặc quá ngắn).'); process.exit(2); }

/* ---------- đọc CSV (RFC 4180) ---------- */
function docCSV(txt) {
  const rows = []; let row = [], o = '', q = false;
  txt = txt.replace(/^﻿/, '');
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { o += '"'; i++; } else q = false; } else o += c; continue; }
    if (c === '"') q = true; else if (c === ',') { row.push(o); o = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; row.push(o); rows.push(row); row = []; o = ''; }
    else o += c;
  }
  if (o !== '' || row.length) { row.push(o); rows.push(row); }
  return rows;
}
const boDau = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, ' ').trim();
function thanhDoiTuong(rows) {
  const i0 = rows.findIndex(r => r.some(c => String(c).trim())); if (i0 < 0) return [];
  const h = rows[i0].map(c => String(c).trim());
  return rows.slice(i0 + 1).filter(r => r.some(c => String(c).trim())).map(r => Object.fromEntries(h.map((k, j) => [k || 'cot' + (j + 1), String(r[j] ?? '').trim()]).filter(([k]) => k)));
}
async function layTrang(ten, batBuoc) {
  try {
    let txt;
    if (NGUON) { const f = join(NGUON, ten + '.csv'); if (!existsSync(f)) { if (batBuoc) throw new Error('không thấy ' + f); return []; } txt = readFileSync(f, 'utf8'); }
    else {
      const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(ID)}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(ten)}`;
      let r; for (let i = 0; i < 4; i++) { try { r = await fetch(url); if (r.ok) break; } catch (e) { r = null; } await new Promise(z => setTimeout(z, 2000 * (i + 1))); }
      if (!r || !r.ok) throw new Error('mã ' + (r ? r.status : 'mạng'));
      txt = await r.text();
      if (/^\s*<!DOCTYPE|<html/i.test(txt)) throw new Error('Sheet chưa chia sẻ "Bất kỳ ai có đường liên kết"');
    }
    return thanhDoiTuong(docCSV(txt));
  } catch (e) { if (batBuoc) throw new Error(`Không đọc được trang "${ten}": ${e.message}`); console.warn(`Bỏ qua trang "${ten}": ${e.message}`); return []; }
}
const gt = (o, ...ten) => { for (const t of ten) { const k = Object.keys(o).find(x => boDau(x) === boDau(t)); if (k && o[k] !== '') return o[k]; } return ''; };
const ngayISO = s => { s = String(s || '').trim(); let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return m[0].slice(0, 10); m = s.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/); if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; m = s.match(/Date\((\d{4}),(\d{1,2}),(\d{1,2})/); if (m) return `${m[1]}-${String(+m[2] + 1).padStart(2, '0')}-${m[3].padStart(2, '0')}`; return ''; };
const homNay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const truNgay = (a, n) => { const d = new Date(a + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
const tu = truNgay(homNay, SO_NGAY);
const linkAnToan = u => /^https?:\/\//i.test(u) ? u : '';

/* ---------- các cột đánh giá do tác vụ AI ghi (trang DanhGia hoặc thêm cột ở Sheet1) ---------- */
const COT_DG = { muc_do: ['Mức độ', 'muc_do'], loai_tin: ['Loại tin', 'loai_tin'], chinh_thong: ['Chính thống', 'chinh_thong'], tom_tat: ['Tóm tắt', 'tom_tat'],
  can_cu: ['Căn cứ', 'can_cu'], trich_dan: ['Trích dẫn', 'trich_dan'], hieu_luc: ['Hiệu lực', 'hieu_luc'], anh_huong_nnt: ['Ảnh hưởng NNT', 'anh_huong_nnt'],
  viec_cqt: ['Việc CQT phải làm', 'viec_cqt'], de_xuat_dv: ['Đề xuất đơn vị', 'de_xuat_dv'], han_de_xuat: ['Hạn đề xuất', 'han_de_xuat'], tu_khoa: ['Từ khóa', 'tu_khoa'], danh_gia_luc: ['Đánh giá lúc', 'danh_gia_luc'] };
const layDG = o => { const r = {}; for (const [k, ten] of Object.entries(COT_DG)) { const v = gt(o, ...ten); if (v) r[k] = v.slice(0, 3000); } return r; };

const [s1, dg, ld, hop, cd] = [await layTrang('Sheet1', true), await layTrang('DanhGia'), await layTrang('LĐ'), await layTrang('LichHop'), await layTrang('Chidao')];
const dgTheoLink = new Map(dg.map(o => [gt(o, 'link', 'Link'), layDG(o)]).filter(([k]) => k));
const daCo = new Set();
const tin = s1.map(o => {
  const link = linkAnToan(gt(o, 'link')), tieu = gt(o, 'title', 'Tiêu đề'), ngay = ngayISO(gt(o, 'date', 'Ngày'));
  if (!link || !tieu || !ngay || ngay < tu || daCo.has(link)) return null; daCo.add(link);
  return Object.assign({ id: '', tieu_de: tieu.slice(0, 500), link, anh: linkAnToan(gt(o, 'img')), nguon: gt(o, 'source', 'Nguồn'), ngay, loai_goc: gt(o, 'type', 'Loại') }, layDG(o), dgTheoLink.get(link) || {});
}).filter(Boolean).sort((a, b) => b.ngay.localeCompare(a.ngay)).slice(0, TOI_DA);
tin.forEach(t => { let h = 0; for (const c of t.link) h = (h * 31 + c.charCodeAt(0)) >>> 0; t.id = h.toString(36); });
const lichHop = hop.filter(o => { const n = ngayISO(gt(o, 'Ngày họp')); return !n || n >= truNgay(homNay, 90); });
const du = { phien_ban: 1, nguon: 'Google Sheet "Bản tin nhanh"', so_ngay: SO_NGAY, tin, lanh_dao: ld, lich_hop: lichHop, chi_dao: cd };
console.log(`Tin ${SO_NGAY} ngày: ${tin.length} (có đánh giá: ${tin.filter(t => t.tom_tat).length}) · lãnh đạo: ${ld.length} · lịch họp: ${lichHop.length} · chỉ đạo: ${cd.length}`);

/* ---------- gói cho từng đơn vị (mật khẩu đơn vị): tin chung + lịch họp, chỉ đạo liên quan đơn vị; không gồm danh sách lãnh đạo ---------- */
const goc = layGoc();
if (goc) {
  const thuMuc = join(ra, '..', 'don-vi'); let n = 0;
  if (ghiNeuDoi(join(thuMuc, 'chung.tin.json'), { phien_ban: 1, so_ngay: SO_NGAY, tin }, khoaDonVi(goc, '__chung'))) n++;
  const lq = (o, ...cot) => { const s = new Set(); cot.forEach(c => dvLienQuan(gt(o, c)).forEach(x => s.add(x))); return s; };
  for (const ma of DS_DON_VI) {
    const h = lichHop.filter(o => lq(o, 'Phòng chủ trì', 'Đơn vị chuẩn bị (app)', 'Thành phần tham gia', 'Đã xác nhận tham gia').has(ma));
    const c = cd.filter(o => lq(o, 'Đơn vị chủ trì', 'Đơn vị phối hợp').has(ma));
    if (ghiNeuDoi(join(thuMuc, ma + '.tin.json'), { phien_ban: 1, don_vi: ma, lich_hop: h, chi_dao: c }, khoaDonVi(goc, ma))) n++;
  }
  console.log(`Gói đơn vị: ${n ? 'đã ghi ' + n + ' tệp' : 'không đổi'}`);
} else console.log('Chưa đặt MA_GOC_DON_VI – bỏ qua gói cho đơn vị.');

/* ---------- khóa, ghi ---------- */
const khoa = salt => pbkdf2Sync(Buffer.from(mk, 'utf8'), salt, LAP, 32, 'sha256');
const soSanh = JSON.stringify(du);
if (existsSync(ra)) {
  try { const o = JSON.parse(readFileSync(ra, 'utf8')); const buf = Buffer.from(o.du, 'base64');
    const d = createDecipheriv('aes-256-gcm', khoa(Buffer.from(o.salt, 'base64')), Buffer.from(o.iv, 'base64')); d.setAuthTag(buf.subarray(buf.length - 16));
    const cu = JSON.parse(Buffer.concat([d.update(buf.subarray(0, buf.length - 16)), d.final()]).toString('utf8')); delete cu.cap_nhat_luc;
    if (JSON.stringify(cu) === soSanh) { console.log('KHONG-DOI'); process.exit(0); } } catch { /* tệp cũ lỗi hoặc đổi mật khẩu: ghi mới */ }
}
const txt = JSON.stringify(Object.assign({ cap_nhat_luc: new Date().toISOString() }, du));
const salt = randomBytes(16), iv = randomBytes(12);
const c = createCipheriv('aes-256-gcm', khoa(salt), iv);
const ct = Buffer.concat([c.update(txt, 'utf8'), c.final(), c.getAuthTag()]);
writeFileSync(ra, JSON.stringify({ maHoa: 'AES-GCM', kdf: 'PBKDF2-SHA256', lap: LAP, salt: salt.toString('base64'), iv: iv.toString('base64'), du: ct.toString('base64'), ghiChu: 'Bản tin đã khóa bằng mật khẩu – chỉ mở được bằng app Báo cáo điều hành' }) + '\n');
console.log('DA-GHI ' + ra);
