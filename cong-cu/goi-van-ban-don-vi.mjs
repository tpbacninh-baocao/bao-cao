// Gói văn bản đến cho từng đơn vị: mỗi đơn vị chỉ nhận văn bản mình CHỦ TRÌ hoặc PHỐI HỢP (không gồm văn bản mật),
// khóa bằng khóa riêng của đơn vị, ghi don-vi/<MÃ>.vbd.json. Chưa đặt secret MA_GOC_DON_VI thì bỏ qua.
// Dùng:  MA_GOC_DON_VI=... node cong-cu/goi-van-ban-don-vi.mjs <van-ban-den.json> <thư-mục-ra>
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DS_DON_VI, dvLienQuan, maDV, layGoc, khoaDonVi, ghiNeuDoi } from './don-vi.mjs';

const [, , vao, ra] = process.argv;
if (!vao || !ra) { console.error('Thiếu tham số: <tệp-vào> <thư-mục-ra>'); process.exit(2); }
const goc = layGoc(); if (!goc) { console.log('Chưa đặt MA_GOC_DON_VI – bỏ qua gói văn bản cho đơn vị.'); process.exit(0); }
const d = JSON.parse(readFileSync(vao, 'utf8'));
let doi = 0;
for (const ma of DS_DON_VI) {
  const ds = (d.van_ban || []).filter(v => {
    if (v.mat) return false;
    if (maDV(v.don_vi_chu_tri || '') === ma) return true;
    return [...(v.phoi_hop || []), (v.cuoc_hop && v.cuoc_hop.thanh_phan) || ''].some(p => dvLienQuan(p).has(ma));
  });
  const theo = {}; ds.forEach(v => { if (v.ngay_nhan) theo[v.ngay_nhan] = (theo[v.ngay_nhan] || 0) + 1; });
  const goi = Object.assign({}, d, { don_vi: ma, tong_so: ds.length, van_ban: ds,
    theo_ngay: Object.entries(theo).sort((a, b) => a[0] < b[0] ? 1 : -1).map(([ngay, so_luong]) => ({ ngay, so_luong })) });
  if (ghiNeuDoi(join(ra, ma + '.vbd.json'), goi, khoaDonVi(goc, ma))) doi++;
  console.log(`${ma}: ${ds.length} văn bản`);
}
console.log(doi ? `DA-GHI ${doi} tệp` : 'KHONG-DOI');
