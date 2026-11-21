// Dùng chung cho các tác vụ GitHub: danh sách đơn vị được cấp mật khẩu riêng, nhận diện đơn vị trong chuỗi,
// khóa dữ liệu riêng của từng đơn vị. Đọc thẳng thư viện nguon/van_ban_den_chung.js để app và tác vụ hiểu giống nhau.
//   khóa đơn vị = HMAC-SHA256(mã gốc, "bao-cao-don-vi|<MÃ>")  (mã gốc: secret MA_GOC_DON_VI, 32 byte base64)
//   tệp dữ liệu = {maHoa:'AES-GCM', khoa:'don-vi', iv, du}    (du = bản mã + 16 byte xác thực, base64)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const cuaSo = {};
new Function('window', readFileSync(join(GOC, 'nguon/van_ban_den_chung.js'), 'utf8'))(cuaSo);
export const VBDC = cuaSo.VBDC;
export const DS_DON_VI = VBDC.DS_DON_VI;
export const maDV = s => VBDC.maDV(s);
export const dvLienQuan = s => VBDC.dvLienQuan(s);
export const tenDV = ma => VBDC.TEN_DV[ma] || ma;

export function layGoc() {
  const g = (process.env.MA_GOC_DON_VI || '').trim();
  if (!g) return null;
  const b = Buffer.from(g, 'base64');
  if (b.length < 32) { console.error('MA_GOC_DON_VI không đúng (cần chuỗi base64 32 byte tạo trong ⚙ Cài đặt của app).'); process.exit(2); }
  return b;
}
export const khoaDonVi = (goc, ma) => createHmac('sha256', goc).update('bao-cao-don-vi|' + ma).digest();
export function maHoa(obj, khoa) {
  const iv = randomBytes(12); const c = createCipheriv('aes-256-gcm', khoa, iv);
  const ct = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final(), c.getAuthTag()]);
  return { maHoa: 'AES-GCM', khoa: 'don-vi', iv: iv.toString('base64'), du: ct.toString('base64') };
}
export function giaiMa(o, khoa) {
  const buf = Buffer.from(o.du, 'base64'); const d = createDecipheriv('aes-256-gcm', khoa, Buffer.from(o.iv, 'base64'));
  d.setAuthTag(buf.subarray(buf.length - 16));
  return JSON.parse(Buffer.concat([d.update(buf.subarray(0, buf.length - 16)), d.final()]).toString('utf8'));
}
/* Ghi tệp đã khóa; nội dung không đổi (bỏ qua cap_nhat_luc) thì giữ nguyên tệp cũ. Trả về true nếu có ghi. */
export function ghiNeuDoi(tep, obj, khoa) {
  const so = o => { const x = Object.assign({}, o); delete x.cap_nhat_luc; return JSON.stringify(x); };
  if (existsSync(tep)) { try { if (so(giaiMa(JSON.parse(readFileSync(tep, 'utf8')), khoa)) === so(obj)) return false; } catch { /* tệp cũ lỗi hoặc đổi mã gốc */ } }
  mkdirSync(dirname(tep), { recursive: true });
  writeFileSync(tep, JSON.stringify(maHoa(obj, khoa)) + '\n'); return true;
}
