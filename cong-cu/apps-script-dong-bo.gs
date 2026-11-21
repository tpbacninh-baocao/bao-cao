/**
 * ĐỒNG BỘ APP BÁO CÁO ĐIỀU HÀNH ↔ GOOGLE SHEET "Bản tin nhanh"
 * App ghi phân công lãnh đạo dự họp (trang LichHop) và chỉ đạo (trang Chidao); đọc lại danh sách lãnh đạo (LĐ),
 * lịch họp, chỉ đạo để mọi máy cùng thấy.
 *
 * CÀI ĐẶT (làm 1 lần, xem huong-dan/HUONG_DAN_DONG_BO_SHEET.md):
 *  1. Mở Sheet "Bản tin nhanh" → Tiện ích mở rộng → Apps Script → xóa mã mẫu, dán toàn bộ tệp này → Lưu.
 *  2. Cài đặt dự án (bánh răng) → Thuộc tính tập lệnh → Thêm: MA_BI_MAT = một chuỗi ngẫu nhiên dài ≥ 20 ký tự.
 *  3. Triển khai → Tùy chọn triển khai mới → Loại: Ứng dụng web → Thực thi với tư cách: Tôi;
 *     Người có quyền truy cập: Bất kỳ ai → Triển khai → cho phép quyền → sao chép URL (kết thúc bằng /exec).
 *  2b. (Mật khẩu đơn vị, nhật ký) Thêm thuộc tính MA_NHAT_KY = chuỗi ngẫu nhiên ≥ 20 ký tự (tạo trong app ⚙ Cài đặt → Mật khẩu đơn vị).
 *      Mã này CHỈ cho phép ghi nhật ký đăng nhập, sử dụng (trang NhatKy) – các đơn vị dùng, không ghi/đọc được gì khác.
 *  4. Trong app: ⚙ Cài đặt → Đồng bộ Google Sheet → dán URL và MA_BI_MAT → Thử kết nối → Tạo file cau_hinh.json.
 * Cột có danh sách thả xuống (VD Lãnh đạo chủ trì, Phòng chủ trì): tự chọn mục khớp; bản đầy đủ ghi ở cột “… (app)”.
 * Mã bí mật chỉ nằm trong cau_hinh.json đã khóa bằng mật khẩu xem – người không có mật khẩu xem không gọi được.
 */
const TRANG = { LD: 'LĐ', HOP: 'LichHop', CD: 'Chidao', NK: 'NhatKy' };
const COT_NK = ['Thời gian', 'Vai trò', 'Đơn vị', 'Hành động', 'Chi tiết', 'Thiết bị', 'Trình duyệt', 'Phiên'];
const TZ = 'Asia/Ho_Chi_Minh';

function doGet() { return traVe({ ok: false, loi: 'Hãy gọi bằng app Báo cáo điều hành.' }); }

function doPost(e) {
  let yc;
  try { yc = JSON.parse(e.postData.contents); } catch (x) { return traVe({ ok: false, loi: 'Yêu cầu không đúng khuôn dạng.' }); }
  const tt = PropertiesService.getScriptProperties();
  const ma = tt.getProperty('MA_BI_MAT') || '', maNK = tt.getProperty('MA_NHAT_KY') || '';
  if (ma.length < 20) return traVe({ ok: false, loi: 'Apps Script chưa đặt MA_BI_MAT (ít nhất 20 ký tự) trong Thuộc tính tập lệnh.' });
  const laQT = !!yc && yc.ma === ma, laNK = !!yc && maNK.length >= 20 && yc.ma === maNK;
  if (!laQT && !(laNK && yc.loai === 'nhatky')) { Utilities.sleep(800); return traVe({ ok: false, loi: 'Sai mã bí mật đồng bộ.' }); }
  try {
    if (yc.loai === 'nhatky') return traVe(ghiNhatKy(yc.du));
    if (yc.loai === 'doc_nhatky') return traVe(docNhatKy());
    if (yc.loai === 'doc') return traVe(docTatCa());
    const khoa = LockService.getDocumentLock(); khoa.waitLock(20000);
    try {
      if (yc.loai === 'hop') return traVe(ghiHop(yc.du || {}, yc.nguoi));
      if (yc.loai === 'chidao') return traVe(ghiChiDao(yc.du || {}, yc.nguoi));
    } finally { khoa.releaseLock(); }
    return traVe({ ok: false, loi: 'Không rõ yêu cầu: ' + yc.loai });
  } catch (x) { return traVe({ ok: false, loi: 'Lỗi Apps Script: ' + x.message }); }
}

function traVe(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function trang(ten) { const s = SpreadsheetApp.getActive().getSheetByName(ten); if (!s) throw new Error('Không thấy trang "' + ten + '"'); return s; }
function boDau(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, ' ').trim(); }
/* Giá trị ô → chữ (ngày dd/MM/yyyy, giờ HH:mm) */
function chu(v) {
  if (v instanceof Date) return v.getFullYear() < 1901 ? Utilities.formatDate(v, TZ, 'HH:mm') : Utilities.formatDate(v, TZ, 'dd/MM/yyyy');
  return v == null ? '' : String(v);
}
/* Chống chèn công thức: ô bắt đầu bằng = + - @ thì thêm dấu ' */
function an(v) { let s = String(v == null ? '' : v).slice(0, 3000); if (/^[=+\-@]/.test(s)) s = "'" + s; return s; }
function docTrang(ten) {
  const s = SpreadsheetApp.getActive().getSheetByName(ten); if (!s || s.getLastRow() < 1) return [];
  const v = s.getDataRange().getValues(); const h = v[0].map(chu);
  return v.slice(1).filter(r => r.some(c => c !== '' && c != null)).map(r => { const o = {}; h.forEach((k, j) => { if (k) o[k] = chu(r[j]); }); return o; });
}
function docTatCa() {
  const gioiHan = new Date(); gioiHan.setDate(gioiHan.getDate() - 90);
  const hop = docTrang(TRANG.HOP).filter(o => { const k = Object.keys(o).find(x => boDau(x) === 'ngay hop'); const m = k && String(o[k]).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return !m || new Date(+m[3], +m[2] - 1, +m[1]) >= gioiHan; });
  return { ok: true, lanh_dao: docTrang(TRANG.LD), lich_hop: hop, chi_dao: docTrang(TRANG.CD).slice(-500) };
}
/* Cột theo tên (thiếu thì thêm vào cuối hàng tiêu đề) */
function cot(s, ten, them) {
  const n = Math.max(1, s.getLastColumn()); const h = s.getRange(1, 1, 1, n).getValues()[0].map(chu);
  let i = h.findIndex(x => boDau(x) === boDau(ten));
  if (i < 0 && them) { i = h.length; s.getRange(1, i + 1).setValue(ten); }
  return i < 0 ? -1 : i + 1;
}
/* Ô có danh sách thả xuống (chỉ nhận giá trị trong danh sách): tìm mục khớp nhất; không khớp thì trả null */
function dsThaXuong(o) {
  const dv = o.getDataValidation(); if (!dv) return null;
  const T = SpreadsheetApp.DataValidationCriteria, loai = dv.getCriteriaType();
  if (loai === T.VALUE_IN_LIST) return { ds: dv.getCriteriaValues()[0].map(String), chat: !dv.getAllowInvalid() };
  if (loai === T.VALUE_IN_RANGE) return { ds: [].concat.apply([], dv.getCriteriaValues()[0].getValues()).map(String).filter(String), chat: !dv.getAllowInvalid() };
  return null;
}
const khoaDV = s => boDau(s).replace(/^đ\/c:?|^d\/c:?/, '').replace(/\b(phong|so|thue|tinh|thanh pho)\b/g, '').replace(/[^a-z0-9]/g, '');
const tenNguoi = s => boDau(String(s).replace(/^\s*đ\/c:?\s*/i, '').split(/\s*[-–]\s*/)[0]).replace(/[^a-z ]/g, '').trim();
function khopMuc(ds, gt, laNguoi) {
  if (ds.indexOf(gt) >= 0) return gt;
  if (laNguoi) { const t = tenNguoi(gt); return ds.find(x => t && tenNguoi(x) === t) || null; }
  const k = khoaDV(gt); if (!k) return null;
  return ds.find(x => khoaDV(x) === k) || ds.find(x => { const kx = khoaDV(x); return kx.length > 2 && (kx.indexOf(k) >= 0 || k.indexOf(kx) >= 0); }) || null;
}
/* Ghi một ô; ô có danh sách thả xuống thì ghi mục khớp (không khớp thì giữ nguyên ô và báo lại) */
function ghiO(s, hang, cot, gt, canhBao, laNguoi) {
  const o = s.getRange(hang, cot); let v = gt == null ? '' : String(gt);
  const tx = dsThaXuong(o);
  if (tx && tx.chat && v) { const m = khopMuc(tx.ds, v, laNguoi); if (m == null) { canhBao.push(s.getRange(1, cot).getValue() + ': "' + v + '" không có trong danh sách thả xuống – giữ nguyên ô.'); return false; } v = m; }
  try { o.setValue(tx && tx.chat ? v : an(v)); return true; } catch (x) { canhBao.push(s.getRange(1, cot).getValue() + ': ' + x.message); return false; }
}
function ghiHop(d, nguoi) {
  const s = trang(TRANG.HOP);
  ['Mã cuộc họp', 'Lãnh đạo dự (app)', 'Đơn vị chuẩn bị (app)', 'Chỉ đạo', 'Người phân công', 'Cập nhật lúc'].forEach(t => cot(s, t, true));
  const C = t => cot(s, t, true);
  const n = s.getLastRow(); const v = n > 1 ? s.getRange(2, 1, n - 1, s.getLastColumn()).getValues() : [];
  const cMa = C('Mã cuộc họp'), cVB = C('Văn bản họp'), cNgay = C('Ngày họp');
  const so = boDau(d.van_ban).replace(/[^a-z0-9\/]/g, '');
  let dong = v.findIndex(r => String(r[cMa - 1]) === String(d.ma_hop));
  if (dong < 0) dong = v.findIndex(r => so && boDau(r[cVB - 1]).replace(/[^a-z0-9\/]/g, '') === so && chu(r[cNgay - 1]) === d.ngay);
  let hang;
  if (dong < 0) { hang = Math.max(2, n + 1); const cStt = cot(s, 'Số thứ tự', false); if (cStt > 0) s.getRange(hang, cStt).setValue(v.length + 1); }
  else hang = dong + 2;
  const canhBao = [];
  const neuTrong = (t, gt) => { const c = C(t); if (!String(s.getRange(hang, c).getValue()) && gt) ghiO(s, hang, c, gt, canhBao); };
  const dat = (t, gt, laNguoi) => ghiO(s, hang, C(t), gt, canhBao, laNguoi);
  const dsLD = String(d.lanh_dao || '').split(/\s*;\s*/).filter(String);
  neuTrong('Văn bản họp', d.van_ban); neuTrong('Ngày văn bản', d.ngay_van_ban); neuTrong('Nơi phát hành', d.noi_phat_hanh); neuTrong('Nội dung cuộc họp', d.noi_dung);
  neuTrong('Giờ họp', d.gio); neuTrong('Ngày họp', d.ngay); neuTrong('Địa điểm', d.dia_diem); neuTrong('Link Giấy mời', d.link_gm);
  dat('Mã cuộc họp', d.ma_hop);
  // Cột có danh sách thả xuống chỉ nhận 1 lãnh đạo, 1 phòng: ghi người/đơn vị đầu tiên khớp danh sách; bản đầy đủ ghi ở cột “(app)”
  dat('Lãnh đạo dự (app)', d.lanh_dao); dat('Đơn vị chuẩn bị (app)', d.phong_chu_tri);
  if (dsLD.length) dat('Lãnh đạo chủ trì', dsLD[0], true); else dat('Lãnh đạo chủ trì', '');
  dat('Phòng chủ trì', d.phong_chu_tri); dat('Thành phần tham gia', d.thanh_phan);
  dat('Trạng thái', d.trang_thai); dat('Chỉ đạo', d.chi_dao); dat('Người phân công', d.nguoi || nguoi); dat('Cập nhật lúc', d.luc || new Date().toISOString());
  return { ok: true, hang: hang, canh_bao: canhBao };
}
function ghiChiDao(d, nguoi) {
  const s = trang(TRANG.CD);
  ['stt', 'Lãnh đạo chỉ đạo', 'Văn bản\\bài báo gốc', 'Nội dung chỉ đạo', 'Đơn vị chủ trì', 'Đơn vị phối hợp', 'Hạn thực hiện', 'Link đính kèm', 'Đơn vị đã tiếp nhận', 'Đơn vị đã hoàn thành', 'Báo cáo kết quả', 'Thời gian giao', 'Phụ trách'].forEach(t => cot(s, t, true));
  const hang = s.getLastRow() + 1; const canhBao = []; const dat = (t, gt) => ghiO(s, hang, cot(s, t, true), gt, canhBao);
  dat('stt', d.stt); dat('Lãnh đạo chỉ đạo', d.lanh_dao); dat('Văn bản\\bài báo gốc', d.goc); dat('Nội dung chỉ đạo', d.noi_dung); dat('Đơn vị chủ trì', d.chu_tri);
  dat('Đơn vị phối hợp', d.phoi_hop); dat('Hạn thực hiện', d.han); dat('Link đính kèm', d.link); dat('Thời gian giao', d.thoi_gian); dat('Phụ trách', d.phu_trach || nguoi);
  return { ok: true, hang: hang, canh_bao: canhBao };
}

/* ---------- Nhật ký đăng nhập, sử dụng (trang NhatKy) ---------- */
function trangNK() {
  const ss = SpreadsheetApp.getActive(); let s = ss.getSheetByName(TRANG.NK);
  if (!s) { s = ss.insertSheet(TRANG.NK); s.getRange(1, 1, 1, COT_NK.length).setValues([COT_NK]).setFontWeight('bold'); s.setFrozenRows(1); }
  return s;
}
function ghiNhatKy(ds) {
  if (!Array.isArray(ds) || !ds.length) return { ok: true, ghi: 0 };
  const bo = CacheService.getScriptCache(), k = 'nk-' + Math.floor(Date.now() / 60000), dem = +(bo.get(k) || 0);
  if (dem > 600) return { ok: false, loi: 'Quá nhiều nhật ký trong 1 phút.' };
  ds = ds.slice(0, 50); bo.put(k, String(dem + ds.length), 120);
  const hang = ds.map(o => { o = o || {}; const t = new Date(o.luc || Date.now());
    return [isNaN(t) ? new Date() : t, o.vai, o.dv, o.hd, o.ct, o.tb, o.td, o.ph].map((v, i) => i === 0 ? v : an(String(v == null ? '' : v).slice(0, 300))); });
  const khoa = LockService.getDocumentLock(); khoa.waitLock(20000);
  try { const s = trangNK(); s.getRange(s.getLastRow() + 1, 1, hang.length, COT_NK.length).setValues(hang); s.getRange(2, 1, s.getLastRow() - 1, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss'); }
  finally { khoa.releaseLock(); }
  return { ok: true, ghi: hang.length };
}
function docNhatKy() {
  const s = trangNK(); const n = s.getLastRow(); if (n < 2) return { ok: true, nhat_ky: [] };
  const tu = Math.max(2, n - 4999); const v = s.getRange(tu, 1, n - tu + 1, COT_NK.length).getValues();
  return { ok: true, nhat_ky: v.map(r => ({ luc: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), vai: r[1], dv: r[2], hd: r[3], ct: r[4], tb: r[5], td: r[6], ph: r[7] })) };
}
