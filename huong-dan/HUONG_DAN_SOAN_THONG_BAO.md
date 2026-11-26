# Soạn nhanh Thông báo / Giấy mời dự họp (có chữ ký người ký)

Tạo nhanh file Word (.docx) Thông báo hoặc Giấy mời tham dự cuộc họp ngay trên điện thoại, đúng thể thức Nghị định 30/2020/NĐ-CP:
khổ A4; lề trên 20 mm, dưới 20 mm, trái 30 mm, phải 15 mm; phông Times New Roman; quốc hiệu, tiêu ngữ, tên cơ quan, số ký hiệu, địa danh ngày tháng, tên loại, trích yếu, nơi nhận, quyền hạn, chức vụ, họ tên người ký; số trang từ trang 2.

## Ai dùng được
| Việc | Lãnh đạo (mật khẩu xem) | Quản trị (đã đăng nhập quản trị) | Đơn vị |
|---|---|---|---|
| Soạn, xem trước, tải Word, chia sẻ | ✔ | ✔ | – |
| Chèn chữ ký người ký | – | ✔ | – |
| Tải ảnh chữ ký, tạo file chữ ký | – | ✔ (⚙ Cài đặt) | – |

## Soạn văn bản (2 phút)
1. Trang chủ → **🗓 Lịch họp** → chọn cuộc họp.
2. (Nếu cần) chọn lãnh đạo dự, đơn vị chủ trì, phối hợp, chỉ đạo – nội dung này tự đưa vào văn bản.
3. Bấm **📝 Soạn thông báo / giấy mời (Word)** → chọn **📢 Thông báo** hoặc **✉ Giấy mời**.
4. Các ô đã điền sẵn (trích yếu, câu mở đầu "Thực hiện … số … của …", thời gian, địa điểm, thành phần, nội dung, tổ chức thực hiện, nơi nhận). Sửa trực tiếp nếu cần.
5. Số văn bản và ngày: để trống cho văn thư cấp số (như mẫu); muốn ghi ngày hôm nay thì tích ô.
6. Chọn **người ký** (danh sách lãnh đạo trang LĐ). Phó Trưởng tự ghi "KT. TRƯỞNG THUẾ THÀNH PHỐ / PHÓ TRƯỞNG THUẾ THÀNH PHỐ".
7. **👁 Xem trước** → **⬇ Tải Word** hoặc **📤 Chia sẻ file** (Zalo, Mail… trên điện thoại).
8. Chương trình kèm theo (không bắt buộc): mỗi dòng `Thời gian | Nội dung | Người thực hiện` → in thành bảng ở trang sau.

## Chữ ký người ký (người quản trị làm 1 lần)
1. Đăng nhập quản trị: **ℹ → 🔐 Đăng nhập quản trị** (hoặc chạm logo **BN** 5 lần) → nhập mật khẩu quản trị.
2. **⚙ Cài đặt** → mục **✍ Chữ ký người ký** → ở từng người bấm **📷 Chọn ảnh** (chụp chữ ký mực xanh/đen trên giấy trắng; app tự bỏ nền trắng, cắt sát nét).
3. Bấm **📄 Tạo file chu_ky.mahoa.json** → nhập lại mật khẩu quản trị → tải file về.
4. Kho GitHub `bao-cao` → **Add file → Upload files** → kéo thả `chu_ky.mahoa.json` (thay file cũ) → **Commit changes**.
5. Từ đó, khi đã đăng nhập quản trị, khung soạn văn bản hiện ô **✍ Chèn chữ ký của …**.

## An toàn
- File chữ ký được **khóa bằng mật khẩu quản trị** (AES-GCM 256, PBKDF2 250.000 vòng), không phải mật khẩu xem: lãnh đạo, đơn vị, người ngoài không mở được. Đặt mật khẩu quản trị dài, khó đoán.
- **Đổi mật khẩu quản trị** thì phải làm lại bước 2–4 (file cũ không mở được bằng mật khẩu mới).
- Mỗi lần tải/chia sẻ văn bản được ghi **nhật ký** (người ký, có chèn chữ ký hay không).
- Ảnh chữ ký chèn vào file Word chỉ để soạn, gửi nhanh. Văn bản phát hành chính thức vẫn theo quy định: văn thư cấp số, đóng dấu (bản giấy) hoặc **ký số** (văn bản điện tử) theo Nghị định 30/2020/NĐ-CP.
