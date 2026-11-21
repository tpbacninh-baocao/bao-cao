# CLAUDE.md – App Báo cáo điều hành, Thuế thành phố Bắc Ninh

Đọc hết tệp này và `TIEN_DO.md` trước khi làm bất cứ việc gì.

## Người dùng
- Cán bộ Văn phòng, **không biết lập trình**. Luôn trả lời bằng **tiếng Việt**, câu ngắn, tránh thuật ngữ.
- Tự chạy lệnh, tự kiểm thử, tự sửa lỗi. Chỉ hỏi khi cần quyết định nghiệp vụ hoặc cần họ bấm thử; khi hỏi, nêu phương án khuyến nghị.
- Kết thúc mỗi lượt: (1) tóm tắt đã làm; (2) các bước bấm để kiểm tra, thấy gì là đúng; (3) cập nhật `TIEN_DO.md`.

## Kho này là NGUỒN GỐC DUY NHẤT của app
- Dùng được từ mọi máy. Mọi thay đổi phải **lên nhánh `main`** mới tính là xong.
- Người dùng đã chọn (21/11/2026): **commit và push thẳng lên `main`**, không để việc nằm trên nhánh `claude/...`. Nếu môi trường không cho đẩy lên `main`, báo rõ và hướng dẫn gộp ngay.
- Trước khi sửa: lấy bản mới nhất của `main`. Kho có tác vụ tự ghi `van-ban-den.mahoa.json` nên trước khi push phải `git pull --rebase`.

## Cấu trúc
```
nguon/dieu_hanh.src.html    mã nguồn app (SỬA Ở ĐÂY)
nguon/van-ban-den.html      mã nguồn trang Văn bản đến (SỬA Ở ĐÂY)
nguon/van_ban_den_chung.js  thư viện dùng chung của 2 trang (ô /*@@VBDC@@*/)
nguon/ban_do_99_xa.json     bản đồ 99 xã, phường (tinhthanhpho.com, CC BY 4.0)
dong_goi.py                 đóng gói ra index.html, van-ban-den.html
thu-vien/                   danh sách thư viện (package.json, package-lock.json)
huong-dan/                  hướng dẫn sử dụng, cài đặt; huong-dan/tac-vu/ là tệp tác vụ mẫu
.github/workflows/          dong-goi.yml (tự đóng gói), lay-van-ban-den.yml (lấy văn bản đến), lay-tin-tuc.yml (bản tin)
cong-cu/                    ma-hoa-van-ban-den.mjs, lay-tin-tuc.mjs (đọc Sheet, khóa), apps-script-dong-bo.gs (dán vào Apps Script của Sheet),
                            don-vi.mjs (danh sách, khóa đơn vị – đọc chính nguon/van_ban_den_chung.js), goi-van-ban-don-vi.mjs
index.html, van-ban-den.html   KẾT QUẢ ĐÓNG GÓI – không sửa tay
cau_hinh.json, van-ban-den.mahoa.json, tin-tuc.mahoa.json, khoa_don_vi.json, don-vi/   tệp đã khóa – không sửa, không xóa
```
- Đóng gói để thử: `cd thu-vien && npm ci --ignore-scripts && cd .. && python dong_goi.py`.
- Trên GitHub, `dong-goi.yml` tự đóng gói khi `nguon/`, `dong_goi.py` hoặc thư viện đổi.

## Bảo mật (bắt buộc) – KHO NÀY CÔNG KHAI
- **Không đưa vào kho:** số liệu thật (kể cả số tổng hợp dùng khi thử), mã số thuế, tên người nộp thuế, nội dung văn bản đến, mật khẩu, khóa API, link thư mục Drive, email cá nhân. Không ghi các thứ đó vào `TIEN_DO.md`, tin commit.
- Kiểm thử bằng **dữ liệu giả**, để ngoài kho. Biểu mẫu thật người dùng đính kèm chỉ đọc trong thư mục tạm, không commit.
- Số liệu báo cáo nằm trên Google Drive, đã khóa bằng mật khẩu xem (AES-GCM 256, PBKDF2-SHA256 250.000 vòng). Mật khẩu quản trị chỉ lưu dạng băm.
- Không dùng CDN. Không gọi dịch vụ ngoài, trừ Google Drive API đã có.
- Trang Văn bản đến chỉ mở link Google Drive/Docs; văn bản mật chỉ hiện nhãn.

## Phân quyền (mật khẩu)
- **Mật khẩu xem** = lãnh đạo (toàn bộ). **Mật khẩu đơn vị** (21 đơn vị, `VBDC.DS_DON_VI`) = chỉ dữ liệu đơn vị mình; không chỉ đạo, phân công, nhập, cài đặt. **Mật khẩu quản trị** = nhập, cài đặt, xuất.
- Dữ liệu đơn vị khóa bằng khóa riêng = HMAC-SHA256(mã gốc, "bao-cao-don-vi|<MÃ>"); mã gốc ở secret `MA_GOC_DON_VI`, máy quản trị, `cau_hinh.json` (đã khóa). Không bao giờ đưa số liệu đơn vị khác vào gói của một đơn vị (chỉ giá trị của mình + thứ hạng, số đơn vị).
- Nhật ký đăng nhập, sử dụng: trang NhatKy qua Apps Script (`MA_NHAT_KY` chỉ ghi được nhật ký).

## Luồng dữ liệu
- **Số liệu:** nhập Excel trên app → Xuất file cho Drive (đã khóa) → mọi máy đọc từ Drive, tự kiểm tra 5 phút/lần.
- **Bản tin, lịch họp, chỉ đạo:** Google Sheet "Bản tin nhanh" (Sheet1, DanhGia, LĐ, LichHop, Chidao) → `lay-tin-tuc.yml` khóa thành `tin-tuc.mahoa.json`. App ghi phân công, chỉ đạo qua Apps Script (địa chỉ + mã trong `cau_hinh.json` đã khóa). Không đưa mã Sheet, link Sheet vào kho.
- **Văn bản đến:** kho riêng tư `theo-doi-van-ban` tạo `xuat/van-ban-den.json` → tác vụ `lay-van-ban-den.yml` lấy về, khóa thành `van-ban-den.mahoa.json` → trang tự kiểm tra 2 phút/lần. **Kho này KHÔNG quét lại văn bản trên Drive và không dùng AI** cho văn bản đến: chỉ chép kết quả đã quét của `theo-doi-van-ban` (không tốn token). Không thêm bước quét, đọc PDF vào kho này.

## Quy tắc nghiệp vụ đã chốt
- Tiền lưu nội bộ theo **triệu đồng**, hiển thị tỷ đồng qua một hàm chung (`tyDong`). Chia cho 0 hiện "–".
- Tỷ lệ của nhóm = tổng tử số ÷ tổng mẫu số, không lấy bình quân tỷ lệ.
- Tiến độ thời gian: Thu NSNN, 99 xã theo ngày; kiểm tra, nợ theo tháng ÷ 12.
- Màu: xanh đậm đạt/vượt; xanh đạt tiến độ; vàng chậm; đỏ chậm quá ngưỡng trong ⚙ (mặc định 10 điểm %).
- Phần 4: tỷ lệ hoàn thành kế hoạch phê duyệt = cột (7) = (6) ÷ (5).
- Phần 6: mục tiêu Cục Thuế (lưu trong ⚙): tổng nợ/tổng thu ≤ 8% (cột 15); nợ thuế, phí/tổng thu ≤ 5% (cột 19).
- 99 xã: "còn phải thu" của một Thuế cơ sở = tổng dự toán – tổng thực hiện (âm thì 0).
- Đơn vị chủ trì của văn bản đến luôn là **dự kiến** cho đến khi thư ký xác nhận trên Sổ theo dõi.
- Mục "Các doanh nghiệp trọng điểm" của biểu thu NSNN có tên doanh nghiệp: **không đọc, không đưa vào app**.

## Cách làm việc
- Giữ nguyên chức năng đã có khi nâng cấp. Mở app qua web có cổng mật khẩu.
- Kiểm tra cả máy tính và khổ điện thoại (375px, xoay ngang): không tràn ngang, không lỗi console.
- Nội dung commit bằng tiếng Việt.
