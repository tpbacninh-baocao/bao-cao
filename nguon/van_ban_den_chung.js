/* Thư viện dùng chung Văn bản đến (gộp sẵn trong trang, không cần file riêng) */
/* =====================================================================
   VĂN BẢN ĐẾN – THƯ VIỆN DÙNG CHUNG
   Dùng cho trang "Văn bản đến" (van-ban-den.html) và app Báo cáo điều hành (index.html):
   - tách nhiệm vụ từ văn bản đến, tính tình trạng hạn theo hôm nay;
   - quy đổi tên đơn vị chủ trì về mã đơn vị của app (QLDN1…, KT1…, TCS1…);
   - gợi ý việc phải làm theo ngày, lịch công việc trong tuần;
   - thống kê theo đơn vị, nhận định để lãnh đạo chỉ đạo;
   - dựng báo cáo nhanh (in / PDF / Word / văn bản / Excel).
   Không gọi dịch vụ ngoài; chạy hoàn toàn trên máy người xem.
   ===================================================================== */
(function(g){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const boDau=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
const norm=s=>boDau(s).replace(/\s+/g,' ').trim();

/* ---------- ngày (chuỗi yyyy-mm-dd, theo múi giờ Việt Nam) ---------- */
const homNay=()=>{ try{ return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }catch(e){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); } };
const dmy=s=>{ const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(s||''); return m?m[3]+'/'+m[2]+'/'+m[1]:(s||''); };
const dm=s=>dmy(s).slice(0,5);
const soNgay=(a,b)=>Math.round((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/86400000);   // a – b (ngày)
const congNgay=(s,n)=>{ const d=new Date(s+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); };
const thuSo=s=>new Date(s+'T00:00:00Z').getUTCDay();
const THU=['Chủ nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'], THU_N=['CN','T2','T3','T4','T5','T6','T7'];
const thu=s=>THU[thuSo(s)];
const ngayLam=s=>{ const d=thuSo(s); return d!==0&&d!==6; };
function luiNgayLam(s,n){ let d=s, k=0; while(k<n){ d=congNgay(d,-1); if(ngayLam(d)) k++; } return d; }
function ngayLamTruoc(s){ let d=congNgay(s,-1); while(!ngayLam(d)) d=congNgay(d,-1); return d; }
function dauTuan(s){ return congNgay(s,-((thuSo(s)+6)%7)); }          // Thứ Hai
function cuoiTuan(s){ return congNgay(dauTuan(s),6); }                 // Chủ nhật
function kyBaoCao(ma,hom,tu,den){
  hom=hom||homNay();
  if(ma==='hom') return {tu:hom, den:hom, ten:'Ngày '+dmy(hom)};
  if(ma==='mai'){ const m=congNgay(hom,1); return {tu:m, den:m, ten:'Ngày mai '+dmy(m)}; }
  if(ma==='tuan') return {tu:dauTuan(hom), den:cuoiTuan(hom), ten:'Tuần này ('+dm(dauTuan(hom))+' – '+dmy(cuoiTuan(hom))+')'};
  if(ma==='tuantoi'){ const a=congNgay(dauTuan(hom),7); return {tu:a, den:congNgay(a,6), ten:'Tuần tới ('+dm(a)+' – '+dmy(congNgay(a,6))+')'}; }
  if(ma==='7') return {tu:congNgay(hom,-6), den:hom, ten:'7 ngày gần đây ('+dm(congNgay(hom,-6))+' – '+dmy(hom)+')'};
  if(ma==='7toi') return {tu:hom, den:congNgay(hom,6), ten:'7 ngày tới ('+dm(hom)+' – '+dmy(congNgay(hom,6))+')'};
  if(ma==='thang'){ const a=hom.slice(0,8)+'01'; const b=congNgay(congNgay(a,32).slice(0,8)+'01',-1); return {tu:a, den:b, ten:'Tháng '+(+hom.slice(5,7))+'/'+hom.slice(0,4)}; }
  if(ma==='30') return {tu:congNgay(hom,-29), den:hom, ten:'30 ngày gần đây'};
  const a=tu||hom, b=den&&den>=a?den:a; return {tu:a, den:b, ten:a===b?'Ngày '+dmy(a):'Từ '+dmy(a)+' đến '+dmy(b)};
}

/* ---------- đơn vị chủ trì → mã đơn vị của app ---------- */
function maDV(s){
  const n=norm(s).replace(/[\s,.\-_()]/g,''); let m;
  if(!n) return null;
  if((m=n.match(/qldn0?(\d)/))||(m=n.match(/doanhnghiepso0?(\d)/))||(m=n.match(/qlhtdn(?:so)?0?(\d)/))) return ['1','2','3'].includes(m[1])?'QLDN'+m[1]:null;
  if((m=n.match(/^(?:thue)?(?:tcs|coso)0?(\d+)/))||(m=n.match(/thuecoso0?(\d+)/))||(m=n.match(/tcs0?(\d+)/))||(m=n.match(/^(?:thue)?cs0?(\d+)$/))) return +m[1]>=1&&+m[1]<=10?'TCS'+(+m[1]):null;
  if((m=n.match(/kiemtra(?:so)?0?(\d)/))||(m=n.match(/^(?:phong)?kt0?(\d)$/))||(m=n.match(/ktra?(?:so)?0?(\d)/))) return ['1','2'].includes(m[1])?'KT'+m[1]:null;
  if(/cntk|canhankinhdoanh|hokinhdoanh/.test(n)) return 'CNTK';
  if(/tccb|tochuccanbo/.test(n)) return 'TCCB';
  if(/nvdtpc|nghiepvudutoan|dutoanphapche|phapche/.test(n)) return 'NVDTPC';
  if(/qlrr|quanlyruiro/.test(n)) return 'QLRR';
  if(/dlrr|dulieu/.test(n)) return 'DLRR';
  if(/^(?:phong)?vanphong|^vp$/.test(n)) return 'VP';
  return null;
}
const khoaDV=s=>maDV(s)||(s&&String(s).trim()?'X:'+norm(s):'X:chua-phan');
const TEN_DV={QLDN1:'Phòng Quản lý, hỗ trợ doanh nghiệp số 1',QLDN2:'Phòng Quản lý, hỗ trợ doanh nghiệp số 2',QLDN3:'Phòng Quản lý, hỗ trợ doanh nghiệp số 3',
  CNTK:'Phòng CNTK',KT1:'Phòng Kiểm tra 1',KT2:'Phòng Kiểm tra 2'};
Object.assign(TEN_DV,{VP:'Văn phòng',TCCB:'Phòng Tổ chức cán bộ',NVDTPC:'Phòng Nghiệp vụ – Dự toán – Pháp chế',QLRR:'Phòng Quản lý rủi ro',DLRR:'Phòng Dữ liệu và rủi ro'});
for(let i=1;i<=10;i++) TEN_DV['TCS'+i]='Thuế cơ sở '+i+' thành phố Bắc Ninh';
/* ---------- Đơn vị được cấp mật khẩu riêng (giữ khớp với cong-cu/don-vi.mjs – tệp đó đọc chính thư viện này) ---------- */
const DS_PHONG=['VP','QLDN1','QLDN2','QLDN3','CNTK','KT1','KT2','TCCB','NVDTPC','QLRR','DLRR'];
const DS_DON_VI=[...DS_PHONG,...Array.from({length:10},(_,i)=>'TCS'+(i+1))];
/* Đơn vị nêu trong một chuỗi (đơn vị chủ trì, phối hợp, thành phần): hiểu cả “các phòng”, “các Thuế cơ sở”, “các đơn vị” */
function dvLienQuan(s){
  const out=new Set(); const t=norm(s); if(!t) return out;
  if(/(cac|tat ca cac|toan bo cac) don vi|toan the/.test(t)){ DS_DON_VI.forEach(x=>out.add(x)); return out; }
  if(/(cac|tat ca cac|toan bo cac) phong/.test(t)) DS_PHONG.forEach(x=>out.add(x));
  if(/(cac|tat ca cac)? ?thue co so(?! ?\d)|cac tcs\b|cac co so/.test(t)) DS_DON_VI.filter(x=>/^TCS/.test(x)).forEach(x=>out.add(x));
  String(s).split(/[;,\n+]|\s+và\s+/).forEach(p=>{ const m=maDV(p); if(m) out.add(m); });
  return out;
}
/* ---------- Khóa riêng của đơn vị ----------
   khoa_don_vi.json: {lap, salt, ds:[{iv,du}]} – mỗi mục là thông tin một đơn vị (mã, tên, khóa dữ liệu…) khóa bằng mật khẩu đơn vị đó.
   Dữ liệu của đơn vị (don-vi/<MÃ>.*.json) khóa bằng khóa riêng (AES-GCM 256, khóa ngẫu nhiên suy từ “mã gốc” của quản trị). */
const b64d=t=>{ const b=atob(t), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; };
const b64e=buf=>{ const u=new Uint8Array(buf); let x=''; for(let i=0;i<u.length;i+=0x8000) x+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(x); };
let KHOA_DV_TEP=null;
async function moKhoaDonVi(mk){
  if(!mk||!(window.crypto&&crypto.subtle)) return null;
  if(!KHOA_DV_TEP){ try{ const r=await fetch('khoa_don_vi.json?t='+Date.now(),{cache:'no-store'}); KHOA_DV_TEP=r.ok?await r.json():false; }catch(e){ return null; } }
  const o=KHOA_DV_TEP; if(!o||!Array.isArray(o.ds)) return null;
  const g=await crypto.subtle.importKey('raw',new TextEncoder().encode(mk),'PBKDF2',false,['deriveKey']);
  const k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64d(o.salt),iterations:o.lap||250000,hash:'SHA-256'},g,{name:'AES-GCM',length:256},false,['decrypt']);
  for(const e of o.ds){ try{ const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(e.iv)},k,b64d(e.du)); const v=JSON.parse(new TextDecoder().decode(pt)); if(v&&v.ma&&v.khoa) return v; }catch(x){} }
  return null;
}
const coTepKhoaDV=async()=>{ if(KHOA_DV_TEP===null){ try{ const r=await fetch('khoa_don_vi.json?t='+Date.now(),{cache:'no-store'}); KHOA_DV_TEP=r.ok?await r.json():false; }catch(e){ return null; } } return !!(KHOA_DV_TEP&&KHOA_DV_TEP.ds); };
async function giaiMaKhoa(o,khoaB64){
  const k=await crypto.subtle.importKey('raw',b64d(khoaB64),{name:'AES-GCM'},false,['decrypt']);
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(o.iv)},k,b64d(o.du)); return JSON.parse(new TextDecoder().decode(pt));
}
async function maHoaKhoa(obj,khoaB64){
  const k=await crypto.subtle.importKey('raw',b64d(khoaB64),{name:'AES-GCM'},false,['encrypt']); const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(JSON.stringify(obj))); return {maHoa:'AES-GCM',khoa:'don-vi',iv:b64e(iv),du:b64e(ct)};
}
/* Khóa dữ liệu của đơn vị = HMAC-SHA256(mã gốc, "bao-cao-don-vi|<MÃ>") – trùng cách tính của cong-cu/don-vi.mjs */
async function khoaTuGoc(gocB64,ma){ const k=await crypto.subtle.importKey('raw',b64d(gocB64),{name:'HMAC',hash:'SHA-256'},false,['sign']); return b64e(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode('bao-cao-don-vi|'+ma))); }

/* ---------- chuẩn bị dữ liệu (cùng cách tính với trang Văn bản đến) ---------- */
const laKhan=v=>/khẩn|hỏa tốc/i.test(v.do_khan||'');
const laKhanCao=v=>/thượng khẩn|hỏa tốc/i.test(v.do_khan||'');
function hopCua(v){ const c=v.cuoc_hop; if(!c||!c.thoi_gian) return null; const s=String(c.thoi_gian); let ngay='', gio='';
  let m=/(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?/.exec(s);
  if(m){ ngay=m[1]+'-'+m[2]+'-'+m[3]; if(m[4]) gio=m[4].padStart(2,'0')+':'+m[5]; }
  else { m=/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/.exec(s); if(!m) return null; ngay=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
    const h=/(\d{1,2})\s*(?:h|giờ|:)\s*(\d{2})?/i.exec(s.replace(m[0],'')); if(h&&+h[1]<24) gio=h[1].padStart(2,'0')+':'+(h[2]||'00'); }
  return {ngay, gio, dd:c.dia_diem||'', ct:c.chu_tri_cuoc_hop||'', tp:c.thanh_phan||''}; }
const soKH=v=>v.so_ky_hieu||(v.so_den?'Số đến '+v.so_den:'(chưa có số)');
function hanChinh(v){ const hs=[]; if(v.han) hs.push(v.han); (v.nhiem_vu||[]).forEach(n=>{ if(n.han) hs.push(n.han); }); hs.sort(); return hs[0]||null; }
function ttHan(han,xong,hom){
  if(xong) return {ma:'xong', nhan:'Hoàn thành', lop:'good'};
  if(!han) return {ma:'khong-han', nhan:'Không nêu hạn', lop:'vien'};
  const c=soNgay(han,hom);
  if(c<0) return {ma:'qua-han', nhan:'Quá hạn '+(-c)+' ngày', c, lop:'bad'};
  if(c===0) return {ma:'hom-nay', nhan:'Hạn hôm nay', c, lop:'cam'};
  if(c<=3) return {ma:'s1-3', nhan:'Còn '+c+' ngày', c, lop:'warn'};
  if(c<=7) return {ma:'tuan', nhan:'Còn '+c+' ngày', c, lop:'xanh'};
  return {ma:'xa', nhan:'Còn '+c+' ngày', c, lop:'good'};
}
function chuanBi(data,hom){
  hom=hom||homNay();
  return (data&&data.van_ban||[]).map((v,i)=>{ const o=Object.assign({},v); o._i=i; o._han=hanChinh(v); o._hop=v.mat?null:hopCua(v); o._khan=!v.mat&&laKhan(v);
    o._dv=v.don_vi_chu_tri||''; o._ma=v.mat?null:khoaDV(v.don_vi_chu_tri); o._t=v.mat?{ma:'mat'}:ttHan(o._han,v.trang_thai==='Hoàn thành',hom); return o; });
}

/* ---------- nhiệm vụ: mỗi văn bản → các việc có hạn; hạn nội bộ chưa ghi thì tính lùi 2 ngày làm việc ---------- */
function dsViec(DS,hom){
  hom=hom||homNay(); const out=[];
  for(const v of DS){
    if(v.mat||v.trang_thai==='Chỉ để biết') continue;   // văn bản chỉ để biết: không giao nhiệm vụ
    const xong=v.trang_thai==='Hoàn thành', deBiet=v.trang_thai==='Chỉ để biết';
    let ls=(v.nhiem_vu||[]).filter(n=>n&&(n.noi_dung||n.han)).map(n=>({nd:n.noi_dung||'Thực hiện nhiệm vụ theo văn bản', han:n.han||null, nb:n.han_noi_bo||null}));
    if(!ls.length&&(v.han||(v.viec_phai_lam||[]).length||(v.noi_dung_bao_cao||[]).length))
      ls=[{nd:(v.viec_phai_lam||[])[0]||((v.noi_dung_bao_cao||[])[0]&&('Báo cáo: '+v.noi_dung_bao_cao[0].noi_dung))||('Tham mưu xử lý văn bản: '+(v.trich_yeu||soKH(v))), han:v.han||null, nb:v.han_noi_bo||null, chung:true}];
    ls.forEach((n,k)=>{
      let nb=n.nb, nbTinh=false; if(!nb&&n.han&&v.han_noi_bo&&n.han===v.han) nb=v.han_noi_bo; if(!nb&&n.han){ nb=luiNgayLam(n.han,2); if(nb<(v.ngay_nhan||'')) nb=n.han; nbTinh=true; }
      const t=ttHan(n.han,xong,hom);
      out.push({id:v._i+'.'+k, v, nd:n.nd, han:n.han, nb, nbTinh, chung:!!n.chung, xong, deBiet, t, ma:v._ma, dv:v._dv, xn:!!v.chu_tri_da_xac_nhan, khan:v._khan, khanCao:laKhanCao(v),
        quaNB:!xong&&nb&&nb<hom&&(!n.han||n.han>=hom)});
    });
  }
  out.forEach(t=>t.diem=diemUuTien(t,hom));
  return out;
}
function dsHop(DS){ return DS.filter(v=>v._hop).map(v=>({v, ngay:v._hop.ngay, gio:v._hop.gio, dd:v._hop.dd, ct:v._hop.ct, tp:v._hop.tp, ma:v._ma, dv:v._dv})).sort((a,b)=>(a.ngay+(a.gio||''))<(b.ngay+(b.gio||''))?-1:1); }
function diemUuTien(t,hom){
  if(t.xong) return 0; let d=0; const c=t.t.c;
  if(t.t.ma==='qua-han') d=100+Math.min(60,-c*3); else if(t.t.ma==='hom-nay') d=92; else if(t.t.ma==='s1-3') d=84-c*4; else if(t.t.ma==='tuan') d=55-c; else if(t.t.ma==='xa') d=25; else d=12;
  if(t.quaNB) d+=8; if(t.nb===hom) d+=10; if(t.khanCao) d+=18; else if(t.khan) d+=8; if(t.deBiet) d-=20; if(!t.ma||/^X:chua/.test(t.ma)) d+=4;
  return Math.max(1,d);
}

/* ---------- gợi ý thực hiện cho một việc ---------- */
function goiY(t,hom){
  hom=hom||homNay(); const v=t.v, a=[];
  if(t.xong) return ['Đã hoàn thành theo Sổ theo dõi.'];
  if(t.t.ma==='qua-han') a.push('⛔ Đã quá hạn '+(-t.t.c)+' ngày: khẩn trương hoàn thành, báo cáo lãnh đạo lý do hoặc xin gia hạn.');
  else if(t.t.ma==='hom-nay') a.push('🟠 Hạn chính thức hôm nay: hoàn thành, trình ký và gửi trong ngày.');
  else if(t.quaNB) a.push('🟡 Đã qua hạn nội bộ ('+dm(t.nb)+'): trình lãnh đạo ngay để kịp hạn '+dm(t.han)+'.');
  else if(t.nb===hom) a.push('🟡 Hôm nay là hạn nội bộ: hoàn thiện kết quả, trình lãnh đạo duyệt.');
  if(t.khanCao) a.push('⚡ Văn bản '+(v.do_khan||'khẩn')+': ưu tiên xử lý ngay trong ngày.');
  (v.viec_phai_lam||[]).slice(0,4).forEach(x=>{ if(x&&x!==t.nd) a.push('• '+x); });
  (v.noi_dung_bao_cao||[]).slice(0,3).forEach(b=>a.push('📝 Báo cáo: '+(b.noi_dung||'')+(b.gui_ai?' – gửi '+b.gui_ai:'')+(b.hinh_thuc?' ('+b.hinh_thuc+')':'')));
  if((v.phoi_hop||[]).length) a.push('🤝 Phối hợp: '+v.phoi_hop.join('; ')+'.');
  if(t.han&&t.t.ma!=='qua-han'&&t.t.ma!=='hom-nay'){
    const bd=ngayBatDau(t,hom);
    a.push('🗓 Triển khai từ '+(bd===hom?'hôm nay':thu(bd)+' '+dm(bd))+'; trình lãnh đạo trước '+thu(t.nb)+' '+dm(t.nb)+(t.nbTinh?' (tính lùi 2 ngày làm việc)':' (hạn nội bộ)')+'; gửi trước '+thu(t.han)+' '+dm(t.han)+'.');
  } else if(!t.han&&!t.deBiet) a.push('🗓 Văn bản không nêu hạn: chủ động lên kế hoạch, báo cáo lãnh đạo khi có kết quả.');
  if(!t.xn) a.push(t.ma&&!/^X:chua/.test(t.ma)?'ℹ Đơn vị chủ trì là dự kiến – chờ Văn phòng xác nhận trên Sổ theo dõi.':'ℹ Chưa phân đơn vị chủ trì – đề nghị Văn phòng trình lãnh đạo phân công.');
  if(v.can_ra_soat) a.push('⚠ Thông tin đang được rà soát – đối chiếu tệp gốc trước khi thực hiện.');
  if(t.deBiet) a.push('📁 Văn bản chủ yếu để biết – nghiên cứu, phổ biến trong đơn vị.');
  return a;
}
function ngayBatDau(t,hom){
  if(!t.nb) return hom;
  let bd=luiNgayLam(t.nb,t.khan?1:3); if(t.v.ngay_nhan&&soNgay(hom,t.v.ngay_nhan)<=1) bd=hom; return bd<hom?hom:bd;
}
/* ---------- lịch việc theo ngày (mốc: triển khai, hạn nội bộ, hạn chính thức, họp) ---------- */
function lichViec(tasks,hops,hom,tu,n){
  hom=hom||homNay(); tu=tu||hom; n=n||7; const den=congNgay(tu,n-1);
  const ngay=Array.from({length:n},(_,i)=>congNgay(tu,i)); const theo={}; ngay.forEach(d=>theo[d]=[]);
  const them=(d,o)=>{ if(theo[d]) theo[d].push(o); };
  for(const t of tasks){ if(t.xong||t.deBiet&&!t.han) continue;
    if(t.t.ma==='qua-han'){ them(hom,{kieu:'qua', t, uu:200+t.diem, text:'Quá hạn '+(-t.t.c)+' ngày – hoàn thành ngay'}); continue; }
    if(t.han) them(t.han,{kieu:'han', t, uu:150+t.diem, text:'Hạn chính thức – gửi kết quả'+((t.v.noi_dung_bao_cao||[])[0]&&t.v.noi_dung_bao_cao[0].gui_ai?' cho '+t.v.noi_dung_bao_cao[0].gui_ai:'')});
    if(t.nb&&t.nb!==t.han&&t.nb>=hom) them(t.nb,{kieu:'nb', t, uu:120+t.diem, text:'Hạn nội bộ – trình lãnh đạo duyệt'});
    else if(t.quaNB) them(hom,{kieu:'nb', t, uu:130+t.diem, text:'Đã qua hạn nội bộ – trình ngay'});
    const bd=ngayBatDau(t,hom); if(bd>=tu&&bd<=den&&bd!==t.nb&&bd!==t.han) them(bd,{kieu:'bd', t, uu:60+t.diem, text:bd===hom&&t.v.ngay_nhan&&soNgay(hom,t.v.ngay_nhan)<=1?'Văn bản mới – nghiên cứu, phân công cán bộ':'Bắt đầu triển khai, dự thảo kết quả'});
    if(!t.han&&t.v.ngay_nhan===hom) them(hom,{kieu:'bd', t, uu:40+t.diem, text:'Văn bản mới – nghiên cứu, lên kế hoạch'});
  }
  for(const h of hops||[]){ if(h.ngay>=tu&&h.ngay<=den) them(h.ngay,{kieu:'hop', h, uu:140, text:'Họp'+(h.gio?' '+h.gio:'')+(h.dd?' tại '+h.dd:'')});
    const tr=ngayLamTruoc(h.ngay); if(tr>=hom&&tr>=tu&&tr<=den) them(tr,{kieu:'cbhop', h, uu:70, text:'Chuẩn bị tài liệu, cử thành phần họp '+thu(h.ngay)+' '+dm(h.ngay)}); }
  return ngay.map(d=>({ngay:d, ds:theo[d].sort((a,b)=>b.uu-a.uu)}));
}

/* ---------- thống kê theo đơn vị chủ trì ---------- */
function tenKhoa(k,dv){ if(!k||k==='X:chua-phan') return 'Chưa phân đơn vị'; if(TEN_DV[k]) return TEN_DV[k]; return dv||k.replace(/^X:/,''); }
function thongKeDV(tasks,hops,hom){
  hom=hom||homNay(); const tuanDen=cuoiTuan(hom); const m={};
  const lay=(k,dv)=>m[k]=m[k]||{ma:k, ten:tenKhoa(k,dv), dv:dv||'', tong:0, dang:0, xong:0, qua:0, hom:0, s3:0, tuan:0, coHan:0, dungHan:0, khan:0, chuaXN:0, hop:0, nbQua:0, diem:0, vb:new Set()};
  for(const t of tasks){ const o=lay(t.ma||'X:chua-phan',t.dv); o.tong++; o.vb.add(t.v._i);
    if(t.xong) o.xong++; else { o.dang++; o.diem+=t.diem; }
    if(t.han){ o.coHan++; if(t.t.ma!=='qua-han') o.dungHan++; }
    if(t.t.ma==='qua-han') o.qua++; else if(t.t.ma==='hom-nay') o.hom++; else if(t.t.ma==='s1-3') o.s3++;
    if(!t.xong&&t.han&&t.han>=hom&&t.han<=tuanDen) o.tuan++;
    if(!t.xong&&t.khan) o.khan++; if(!t.xn) o.chuaXN++; if(t.quaNB) o.nbQua++; }
  for(const h of hops||[]){ if(h.ngay<hom) continue; const o=lay(h.ma||'X:chua-phan',h.dv); o.hop++; }
  return Object.values(m).map(o=>{ o.soVB=o.vb.size; delete o.vb; o.tlDung=o.coHan?o.dungHan/o.coHan:null;
    o.muc=o.qua>0?'bad':(o.hom+o.s3+o.nbQua)>0?'warn':o.dang>0?'info':'good'; return o; })
    .sort((a,b)=>(a.ma==='X:chua-phan')-(b.ma==='X:chua-phan')||b.qua-a.qua||(b.hom+b.s3)-(a.hom+a.s3)||b.dang-a.dang);
}

/* ---------- nhận định nhanh cho lãnh đạo ---------- */
function nhanDinh(DS,tasks,hops,hom){
  hom=hom||homNay(); const out=[]; const mai=congNgay(hom,1);
  const tk=thongKeDV(tasks,hops,hom); const mo=tasks.filter(t=>!t.xong);
  const qua=mo.filter(t=>t.t.ma==='qua-han'), hn=mo.filter(t=>t.t.ma==='hom-nay'), s3=mo.filter(t=>t.t.ma==='s1-3');
  if(qua.length){ const dvq=tk.filter(o=>o.qua).slice(0,4).map(o=>o.ten+' ('+o.qua+')').join(', ');
    out.push({lv:'bad', t:'<b>'+qua.length+' nhiệm vụ đã quá hạn</b>'+(dvq?' – tập trung ở: '+esc(dvq):'')+'. Đề nghị lãnh đạo đôn đốc, yêu cầu báo cáo lý do và thời gian hoàn thành.'}); }
  if(hn.length) out.push({lv:'warn', t:'<b>'+hn.length+' nhiệm vụ đến hạn hôm nay</b> – kiểm tra tiến độ trình ký trước 16h00.'});
  if(s3.length) out.push({lv:'warn', t:'<b>'+s3.length+' nhiệm vụ đến hạn trong 1–3 ngày tới</b> – các đơn vị cần trình lãnh đạo theo hạn nội bộ.'});
  const nbHom=mo.filter(t=>t.nb===hom&&t.t.ma!=='hom-nay'&&t.t.ma!=='qua-han').length; if(nbHom) out.push({lv:'info', t:'<b>'+nbHom+' nhiệm vụ có hạn nội bộ hôm nay</b> – lãnh đạo dự kiến nhận dự thảo để duyệt.'});
  const khan=mo.filter(t=>t.khanCao).length; if(khan) out.push({lv:'bad', t:'<b>'+khan+' nhiệm vụ thượng khẩn / hỏa tốc</b> chưa hoàn thành – ưu tiên xử lý ngay.'});
  const hopMai=(hops||[]).filter(h=>h.ngay===hom||h.ngay===mai); if(hopMai.length) out.push({lv:'info', t:'<b>'+hopMai.length+' cuộc họp hôm nay và ngày mai</b> – kiểm tra thành phần dự, tài liệu chuẩn bị.'});
  const chuaPhan=DS.filter(v=>!v.mat&&!v.don_vi_chu_tri&&v.trang_thai!=='Chỉ để biết'&&v.trang_thai!=='Hoàn thành').length; if(chuaPhan) out.push({lv:'warn', t:'<b>'+chuaPhan+' văn bản chưa phân đơn vị chủ trì</b> – Văn phòng trình lãnh đạo phân công trong ngày.'});
  const chuaXN=DS.filter(v=>!v.mat&&v.don_vi_chu_tri&&!v.chu_tri_da_xac_nhan&&v.trang_thai!=='Hoàn thành').length; if(chuaXN) out.push({lv:'info', t:'<b>'+chuaXN+' văn bản có đơn vị chủ trì dự kiến</b>, chưa xác nhận trên Sổ theo dõi.'});
  const nhan=DS.filter(v=>v.ngay_nhan===hom).length; if(nhan) out.push({lv:'info', t:'Hôm nay nhận <b>'+nhan+' văn bản</b>'+(DS.filter(v=>v.ngay_nhan===hom&&v._khan).length?', trong đó '+DS.filter(v=>v.ngay_nhan===hom&&v._khan).length+' văn bản khẩn':'')+'.'});
  // ngày dồn nhiều hạn trong 7 ngày tới
  const dem={}; mo.forEach(t=>{ if(t.han&&t.han>hom&&soNgay(t.han,hom)<=7) dem[t.han]=(dem[t.han]||0)+1; });
  const dinh=Object.entries(dem).sort((a,b)=>b[1]-a[1])[0]; if(dinh&&dinh[1]>=3) out.push({lv:'info', t:'Hạn dồn nhiều vào <b>'+thu(dinh[0])+' '+dmy(dinh[0])+'</b> ('+dinh[1]+' nhiệm vụ) – nên nhắc các đơn vị chủ động hoàn thành sớm.'});
  const tai=tk.filter(o=>o.ma!=='X:chua-phan'&&o.dang>0).sort((a,b)=>b.diem-a.diem)[0]; if(tai&&tai.dang>=5) out.push({lv:'info', t:'Đơn vị nhiều việc nhất: <b>'+esc(tai.ten)+'</b> – '+tai.dang+' nhiệm vụ đang xử lý'+(tai.qua?', '+tai.qua+' quá hạn':'')+'.'});
  if(!out.length) out.push({lv:'good', t:'Không có nhiệm vụ quá hạn hoặc đến hạn gấp. Tiếp tục theo dõi theo kế hoạch.'});
  return out;
}

/* ---------- BÁO CÁO NHANH ---------- */
const MAU_LOP={bad:'#d92d20',cam:'#c2410c',warn:'#b45309',good:'#15803d',xanh:'#0e7490',vien:'#5d6b80',info:'#1d5bd8'};
const tagIn=t=>'<span style="color:'+(MAU_LOP[t.lop]||'#333')+';font-weight:700">'+esc(t.nhan||'')+'</span>';
const LOAI_BC={
  tonghop:'Báo cáo tổng hợp điều hành văn bản đến',
  giaoviec:'Phiếu theo dõi, đôn đốc nhiệm vụ',
  ngay:'Báo cáo công việc trong ngày',
  tuan:'Kế hoạch công việc trong tuần'
};
/* opts: {loai, ky:{tu,den,ten}, dv:''|khóa đơn vị|'*' (mỗi đơn vị một phiếu), DS, hom, nguoiLap, capNhat} → {html, text, csv:[[...]]} */
function baoCao(opts){
  const hom=opts.hom||homNay(), ky=opts.ky||kyBaoCao('tuan',hom), DS=opts.DS||[], loai=opts.loai||'tonghop';
  const tasks=opts.tasks||dsViec(DS,hom), hops=opts.hops||dsHop(DS);
  const trong=d=>d&&d>=ky.tu&&d<=ky.den;
  const tk=thongKeDV(tasks,hops,hom);
  let dvs=[null];
  if(opts.dv==='*') dvs=tk.filter(o=>o.dang>0||o.hop>0).map(o=>o.ma);
  else if(opts.dv) dvs=[opts.dv];
  const phan=[], text=[], csv=[['Đơn vị chủ trì','Số ký hiệu','Số đến','Nơi gửi','Ngày nhận','Trích yếu','Nhiệm vụ','Hạn nội bộ','Hạn chính thức','Tình trạng','Gợi ý thực hiện']];
  dvs.forEach((dv,ix)=>{ const r=mucBaoCao({loai,ky,dv,DS,tasks,hops,hom,trong,tk,opts}); phan.push((ix?'<div style="page-break-before:always;break-before:page"></div>':'')+r.html); text.push(r.text); r.csv.forEach(x=>csv.push(x)); });
  return {html:phan.join(''), text:text.join('\n\n────────────\n\n'), csv, ten:LOAI_BC[loai]||'Báo cáo'};
}
function dauVanBan(tieu,phu,hom,kinhGui){
  return '<table style="width:100%;border:0;margin-bottom:6px"><tr><td style="border:0;width:45%;text-align:center;vertical-align:top;font-size:12.5pt">CỤC THUẾ<br><b>THUẾ THÀNH PHỐ BẮC NINH</b><div style="width:90px;border-top:1px solid #000;margin:3px auto 0"></div></td>'+
    '<td style="border:0;text-align:center;vertical-align:top;font-size:12.5pt"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><b>Độc lập – Tự do – Hạnh phúc</b><div style="width:170px;border-top:1px solid #000;margin:3px auto 0"></div><i style="display:block;margin-top:6px">Bắc Ninh, ngày '+hom.slice(8)+' tháng '+hom.slice(5,7)+' năm '+hom.slice(0,4)+'</i></td></tr></table>'+
    '<h1 style="text-align:center;font-size:15pt;margin:14px 0 2px;text-transform:uppercase">'+esc(tieu)+'</h1><p style="text-align:center;margin:0 0 10px;font-style:italic">'+esc(phu)+'</p>'+
    (kinhGui?'<p style="text-align:center;margin:0 0 12px">Kính gửi: <b>'+esc(kinhGui)+'</b></p>':'');
}
const H2=t=>'<h2 style="font-size:13pt;margin:14px 0 6px;text-transform:uppercase">'+t+'</h2>';
const TH='style="border:1px solid #555;padding:4px 6px;background:#e8eef8;font-size:10.5pt"', TD='style="border:1px solid #555;padding:4px 6px;vertical-align:top;font-size:10.5pt"', TDDO='style="border:1px solid #555;padding:4px 6px;vertical-align:top;font-size:10.5pt;color:#d92d20;font-weight:700"';
function bangViec(ds,hom,coDV,coGoiY){
  if(!ds.length) return '<p style="margin:4px 0 8px;font-style:italic">Không có.</p>';
  return '<table style="border-collapse:collapse;width:100%;margin:4px 0 10px"><thead><tr><th '+TH+'>STT</th>'+(coDV?'<th '+TH+'>Đơn vị chủ trì</th>':'')+'<th '+TH+'>Văn bản</th><th '+TH+'>Nội dung nhiệm vụ'+(coGoiY?' và gợi ý thực hiện':'')+'</th><th '+TH+'>Hạn nội bộ</th><th '+TH+'>Hạn chính thức</th><th '+TH+'>Tình trạng</th></tr></thead><tbody>'+
    ds.map((t,i)=>'<tr><td '+TD+' align="center">'+(i+1)+'</td>'+(coDV?'<td '+TD+'>'+esc(tenKhoa(t.ma,t.dv))+(t.xn?'':' <i>(dự kiến)</i>')+'</td>':'')+
      '<td '+TD+'><b>'+esc(soKH(t.v))+'</b><br>'+esc(t.v.noi_gui||'')+'<br><i>'+esc(t.v.trich_yeu||'')+'</i>'+(t.v.do_khan?'<br><b style="color:#7c3aed">'+esc(t.v.do_khan)+'</b>':'')+'</td>'+
      '<td '+TD+'><b>'+esc(t.nd)+'</b>'+(coGoiY?'<div style="margin-top:3px;font-size:10pt">'+goiY(t,hom).map(esc).join('<br>')+'</div>':'')+'</td>'+
      '<td '+TD+' align="center">'+(t.nb?dmy(t.nb)+(t.nbTinh?'<br><i style="font-size:9pt">(tính lùi)</i>':''):'–')+'</td><td '+TD+' align="center"><b>'+(t.han?dmy(t.han):'–')+'</b></td><td '+TD+' align="center">'+tagIn(t.t)+'</td></tr>').join('')+'</tbody></table>';
}
function bangHop(ds){
  if(!ds.length) return '<p style="margin:4px 0 8px;font-style:italic">Không có cuộc họp.</p>';
  return '<table style="border-collapse:collapse;width:100%;margin:4px 0 10px"><thead><tr><th '+TH+'>Thời gian</th><th '+TH+'>Nội dung</th><th '+TH+'>Địa điểm</th><th '+TH+'>Chủ trì / thành phần</th><th '+TH+'>Đơn vị chuẩn bị</th></tr></thead><tbody>'+
    ds.map(h=>'<tr><td '+TD+' align="center"><b>'+(h.gio||'')+'</b><br>'+thu(h.ngay)+' '+dmy(h.ngay)+'</td><td '+TD+'><b>'+esc(soKH(h.v))+'</b> – '+esc(h.v.trich_yeu||'')+'</td><td '+TD+'>'+esc(h.dd||'')+'</td><td '+TD+'>'+esc([h.ct&&'Chủ trì: '+h.ct,h.tp].filter(Boolean).join('; '))+'</td><td '+TD+'>'+esc(tenKhoa(h.ma,h.dv))+'</td></tr>').join('')+'</tbody></table>';
}
function bangLich(lich,hom,coDV){
  return '<table style="border-collapse:collapse;width:100%;margin:4px 0 10px"><thead><tr><th '+TH+' style="width:16%">Ngày</th><th '+TH+'>Việc phải làm</th></tr></thead><tbody>'+
    lich.map(d=>'<tr><td '+TD+'><b>'+thu(d.ngay)+'</b><br>'+dmy(d.ngay)+(d.ngay===hom?'<br><b style="color:#c2410c">HÔM NAY</b>':'')+'</td><td '+TD+'>'+(d.ds.length?d.ds.map(x=>{ const v=x.t?x.t.v:x.h.v;
      return '• <b>'+esc(x.text)+'</b>: '+esc(soKH(v))+' – '+esc(x.t?x.t.nd:(v.trich_yeu||''))+(coDV?' <i>['+esc(tenKhoa(x.t?x.t.ma:x.h.ma,x.t?x.t.dv:x.h.dv))+']</i>':''); }).join('<br>'):'<i>Không có việc theo hạn – tiếp tục các nhiệm vụ đang thực hiện.</i>')+'</td></tr>').join('')+'</tbody></table>';
}
function mucBaoCao(o){
  const {loai,ky,dv,DS,hom,trong,opts}=o; const coDV=!dv;
  const tasks=dv?o.tasks.filter(t=>(t.ma||'X:chua-phan')===dv):o.tasks, hops=dv?o.hops.filter(h=>(h.ma||'X:chua-phan')===dv):o.hops;
  const tenDV=dv?tenKhoa(dv,(tasks[0]||hops[0]||{}).dv):'';
  const mo=tasks.filter(t=>!t.xong).sort((a,b)=>b.diem-a.diem);
  const qua=mo.filter(t=>t.t.ma==='qua-han'), denHan=mo.filter(t=>t.t.ma!=='qua-han'&&(trong(t.han)||trong(t.nb))).sort((a,b)=>(a.nb||a.han||'9')<(b.nb||b.han||'9')?-1:1);
  const khongHan=mo.filter(t=>!t.han&&!t.deBiet), hopKy=hops.filter(h=>trong(h.ngay));
  const vbKy=DS.filter(v=>trong(v.ngay_nhan)&&(!dv||(v._ma||'X:chua-phan')===dv));
  const sau=mo.filter(t=>t.han&&t.han>ky.den&&t.t.ma!=='qua-han');
  let h='', tx=[]; const csv=[];
  const tieu=(LOAI_BC[loai]||'Báo cáo')+(dv?'':'');
  const lichTu=loai==='ngay'?ky.tu:(ky.tu<hom&&ky.den>=hom?hom:ky.tu), lichN=Math.max(1,Math.min(14,soNgay(ky.den,lichTu)+1));
  h+=dauVanBan(tieu, ky.ten+(opts.capNhat?' · số liệu cập nhật '+opts.capNhat:''), hom, dv?tenDV:(loai==='tonghop'?'Lãnh đạo Thuế thành phố':''));
  tx.push((LOAI_BC[loai]||'Báo cáo').toUpperCase()); tx.push(ky.ten+(dv?' – '+tenDV:'')); tx.push('');
  // I. Tình hình chung
  const tom=[ 'Văn bản nhận trong kỳ: <b>'+vbKy.length+'</b>', 'Nhiệm vụ đang xử lý: <b>'+mo.length+'</b>', 'Quá hạn: <b style="color:#d92d20">'+qua.length+'</b>',
    'Đến hạn trong kỳ: <b>'+denHan.length+'</b>', 'Cuộc họp trong kỳ: <b>'+hopKy.length+'</b>' ];
  h+=H2('I. Tình hình chung')+'<p style="margin:0 0 6px">'+tom.join(' · ')+'.</p>';
  tx.push('I. TÌNH HÌNH CHUNG: '+tom.map(s=>s.replace(/<[^>]+>/g,'')).join('; ')+'.');
  let so=1; const La=['II','III','IV','V','VI','VII','VIII'];
  const muc=(t)=>H2(La[so++ -1]+'. '+t);
  if(loai==='tonghop'&&!dv){
    const nd=nhanDinh(DS,tasks,hops,hom);
    h+=muc('Nhận định và đề xuất chỉ đạo')+'<ul style="margin:0 0 8px 18px;padding:0">'+nd.map(x=>'<li style="margin:2px 0">'+x.t+'</li>').join('')+'</ul>';
    tx.push(''); tx.push('NHẬN ĐỊNH, ĐỀ XUẤT:'); nd.forEach(x=>tx.push('- '+x.t.replace(/<[^>]+>/g,'')));
    const tk=o.tk.filter(x=>x.tong);
    h+=muc('Tổng hợp theo đơn vị chủ trì')+'<table style="border-collapse:collapse;width:100%;margin:4px 0 10px"><thead><tr><th '+TH+'>Đơn vị chủ trì</th><th '+TH+'>Đang xử lý</th><th '+TH+'>Quá hạn</th><th '+TH+'>Hạn hôm nay</th><th '+TH+'>Hạn 1–3 ngày</th><th '+TH+'>Hạn trong tuần</th><th '+TH+'>Họp sắp tới</th><th '+TH+'>Đã hoàn thành</th><th '+TH+'>Tỷ lệ chưa quá hạn</th></tr></thead><tbody>'+
      tk.map(x=>'<tr><td '+TD+'><b>'+esc(x.ten)+'</b></td>'+[x.dang,x.qua,x.hom,x.s3,x.tuan,x.hop,x.xong].map((n,i)=>'<td '+(i===1&&n?TDDO:TD)+' align="center">'+(n||'–')+'</td>').join('')+'<td '+TD+' align="center">'+(x.tlDung==null?'–':Math.round(x.tlDung*100)+'%')+'</td></tr>').join('')+'</tbody></table>';
    tx.push(''); tx.push('THEO ĐƠN VỊ CHỦ TRÌ:'); tk.forEach(x=>tx.push('- '+x.ten+': đang xử lý '+x.dang+(x.qua?', quá hạn '+x.qua:'')+(x.hom+x.s3?', hạn ≤3 ngày '+(x.hom+x.s3):'')+(x.hop?', họp '+x.hop:'')));
  }
  if(loai!=='tuan'){
    h+=muc('Nhiệm vụ quá hạn cần đôn đốc')+bangViec(qua,hom,coDV,loai==='giaoviec');
    tx.push(''); tx.push('NHIỆM VỤ QUÁ HẠN ('+qua.length+'):'); qua.forEach((t,i)=>tx.push((i+1)+'. '+soKH(t.v)+' – '+t.nd+' – hạn '+dmy(t.han)+' ('+t.t.nhan+')'+(coDV?' – '+tenKhoa(t.ma,t.dv):'')));
    h+=muc('Nhiệm vụ đến hạn trong kỳ')+bangViec(denHan,hom,coDV,loai==='giaoviec'||loai==='ngay');
    tx.push(''); tx.push('ĐẾN HẠN TRONG KỲ ('+denHan.length+'):'); denHan.forEach((t,i)=>tx.push((i+1)+'. '+soKH(t.v)+' – '+t.nd+' – hạn nội bộ '+(t.nb?dmy(t.nb):'–')+', hạn '+(t.han?dmy(t.han):'–')+(coDV?' – '+tenKhoa(t.ma,t.dv):'')));
  }
  if(loai==='giaoviec'||loai==='tuan'||loai==='ngay'){
    const lich=lichViec(tasks,hops,hom,lichTu,lichN);
    h+=muc(loai==='ngay'?'Việc phải làm theo ngày':'Lịch công việc theo ngày (gợi ý)')+bangLich(lich,hom,coDV);
    tx.push(''); tx.push('LỊCH CÔNG VIỆC:'); lich.forEach(d=>{ tx.push(thu(d.ngay)+' '+dmy(d.ngay)+':'); if(!d.ds.length) tx.push('  (không có việc theo hạn)'); d.ds.forEach(x=>{ const v=x.t?x.t.v:x.h.v; tx.push('  - '+x.text+': '+soKH(v)+' – '+(x.t?x.t.nd:(v.trich_yeu||''))+(coDV?' ['+tenKhoa(x.t?x.t.ma:x.h.ma,x.t?x.t.dv:x.h.dv)+']':'')); }); });
  }
  if(loai==='tuan'){ h+=muc('Nhiệm vụ cần thực hiện trong tuần (chi tiết)')+bangViec([...qua,...denHan],hom,coDV,true); }
  h+=muc('Lịch họp trong kỳ')+bangHop(hopKy);
  tx.push(''); tx.push('LỊCH HỌP ('+hopKy.length+'):'); hopKy.forEach(x=>tx.push('- '+(x.gio||'')+' '+thu(x.ngay)+' '+dmy(x.ngay)+(x.dd?' tại '+x.dd:'')+': '+(x.v.trich_yeu||soKH(x.v))));
  if(loai==='giaoviec'&&(sau.length||khongHan.length)){ h+=muc('Nhiệm vụ đang theo dõi (hạn sau kỳ hoặc không nêu hạn)')+bangViec([...sau,...khongHan].slice(0,40),hom,coDV,false); }
  if(loai==='tonghop'||loai==='ngay'){
    h+=muc('Văn bản nhận trong kỳ')+(vbKy.length?'<table style="border-collapse:collapse;width:100%;margin:4px 0 10px"><thead><tr><th '+TH+'>STT</th><th '+TH+'>Ngày nhận</th><th '+TH+'>Số ký hiệu – Nơi gửi</th><th '+TH+'>Trích yếu</th><th '+TH+'>Đơn vị chủ trì</th><th '+TH+'>Hạn</th></tr></thead><tbody>'+
      vbKy.slice().sort((a,b)=>a.ngay_nhan<b.ngay_nhan?1:-1).slice(0,120).map((v,i)=>'<tr><td '+TD+' align="center">'+(i+1)+'</td><td '+TD+' align="center">'+dm(v.ngay_nhan)+'</td><td '+TD+'><b>'+esc(soKH(v))+'</b><br>'+esc(v.noi_gui||'')+'</td><td '+TD+'>'+(v.mat?'<i>'+esc(v.nhan||'Văn bản mật')+'</i>':esc(v.trich_yeu||''))+'</td><td '+TD+'>'+(v.mat?'':esc(v.don_vi_chu_tri||'Chưa phân')+(v.don_vi_chu_tri&&!v.chu_tri_da_xac_nhan?' <i>(dự kiến)</i>':''))+'</td><td '+TD+' align="center">'+(v._han?dmy(v._han):'–')+'</td></tr>').join('')+'</tbody></table>'+(vbKy.length>120?'<p><i>… và '+(vbKy.length-120)+' văn bản khác.</i></p>':''):'<p style="margin:4px 0 8px;font-style:italic">Không có.</p>');
  }
  if(loai==='giaoviec') h+='<p style="margin:12px 0 0">Đề nghị '+(dv?'<b>'+esc(tenDV)+'</b>':'các đơn vị chủ trì')+' chủ động triển khai các nhiệm vụ trên, trình lãnh đạo theo hạn nội bộ và báo cáo kết quả về Văn phòng đúng hạn. Trường hợp không kịp hạn, báo cáo lãnh đạo trước hạn ít nhất 01 ngày làm việc.</p>';
  h+='<table style="width:100%;border:0;margin-top:18px"><tr><td style="border:0;vertical-align:top;font-size:10.5pt;width:50%"><b><i>Nơi nhận:</i></b><br>- '+(dv?esc(tenDV):'Lãnh đạo Thuế thành phố')+';<br>- Lưu: VP.</td><td style="border:0;text-align:center;vertical-align:top"><b>'+(opts.nguoiLap?esc(opts.nguoiLap):'NGƯỜI LẬP')+'</b><br><br><br><br><i style="font-size:10pt">(Lập tự động từ trang Văn bản đến, '+dmy(hom)+')</i></td></tr></table>';
  [...qua,...denHan,...(loai==='giaoviec'?[...sau,...khongHan]:[])].forEach(t=>csv.push([tenKhoa(t.ma,t.dv),t.v.so_ky_hieu||'',t.v.so_den||'',t.v.noi_gui||'',dmy(t.v.ngay_nhan),t.v.trich_yeu||'',t.nd,t.nb?dmy(t.nb):'',t.han?dmy(t.han):'',t.t.nhan||'',goiY(t,hom).join(' | ')]));
  return {html:h, text:tx.join('\n'), csv};
}
/* Bọc thành một trang hoàn chỉnh (in, lưu PDF, mở bằng Word) */
function trangIn(tieu,than,word){
  return '<!DOCTYPE html><html lang="vi"'+(word?' xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"':'')+'><head><meta charset="utf-8"><title>'+esc(tieu)+'</title>'+
    (word?'<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->':'')+
    '<style>@page{size:A4 '+(word?'portrait':'landscape')+';margin:15mm 14mm}body{font-family:"Times New Roman",Times,serif;font-size:12.5pt;color:#000;line-height:1.35;margin:0;padding:'+(word?'0':'10px')+'}table{page-break-inside:auto}tr{page-break-inside:avoid}h1,h2{font-family:"Times New Roman",Times,serif}@media screen{body{max-width:1100px;margin:0 auto;padding:24px}}</style></head><body>'+than+'</body></html>';
}
function taiTep(ten,noiDung,kieu){ const b=new Blob([noiDung],{type:kieu}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=ten; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500); }
function tenTep(s){ return boDau(s).replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'').slice(0,80)||'Bao_cao'; }
function inTrang(tieu,than){
  const html=trangIn(tieu,than,false);
  let w=null; try{ w=window.open('','_blank'); }catch(e){}
  if(w&&w.document){ w.document.open(); w.document.write(html); w.document.close(); setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} },400); return; }
  const f=document.createElement('iframe'); f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0'; document.body.appendChild(f);
  f.contentDocument.open(); f.contentDocument.write(html); f.contentDocument.close(); setTimeout(()=>{ try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(e){} setTimeout(()=>f.remove(),2000); },400);
}
function taiWord(tieu,than){ taiTep(tenTep(tieu)+'.doc','\ufeff'+trangIn(tieu,than,true),'application/msword'); }
function taiCSV(tieu,rows){ const o=x=>'"'+String(x==null?'':x).replace(/"/g,'""')+'"'; taiTep(tenTep(tieu)+'.csv','\ufeff'+rows.map(r=>r.map(o).join(',')).join('\r\n'),'text/csv;charset=utf-8'); }
async function saoChep(t){ try{ await navigator.clipboard.writeText(t); return true; }catch(e){ const a=document.createElement('textarea'); a.value=t; a.style.cssText='position:fixed;left:-9999px'; document.body.appendChild(a); a.select(); let ok=false; try{ ok=document.execCommand('copy'); }catch(_){} a.remove(); return ok; } }

g.VBDC={phienBan:1, esc, boDau, norm, homNay, dmy, dm, soNgay, congNgay, thu, THU, THU_N, ngayLam, luiNgayLam, dauTuan, cuoiTuan, kyBaoCao,
  maDV, khoaDV, tenKhoa, TEN_DV, DS_PHONG, DS_DON_VI, dvLienQuan, moKhoaDonVi, coTepKhoaDV, giaiMaKhoa, maHoaKhoa, khoaTuGoc, b64e, b64d, chuanBi, dsViec, dsHop, ttHan, goiY, ngayBatDau, lichViec, thongKeDV, nhanDinh, soKH, laKhanCao,
  LOAI_BC, baoCao, trangIn, inTrang, taiWord, taiCSV, taiTep, tenTep, saoChep};
})(window);