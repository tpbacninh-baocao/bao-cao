# Mật khẩu riêng cho từng phòng, Thuế cơ sở · nhật ký đăng nhập

## Phân quyền
| Mật khẩu | Ai dùng | Thấy gì |
|---|---|---|
| **Mật khẩu xem** (đang dùng) | Lãnh đạo | Toàn bộ: 6 phần số liệu, sơ đồ, xếp hạng mọi đơn vị, mọi văn bản đến, lịch họp (phân công), truyền thông (chỉ đạo), nhật ký |
| **Mật khẩu đơn vị** (mới, 21 mật khẩu) | Từng phòng, Thuế cơ sở | Kết quả, thứ hạng **của đơn vị mình** theo từng nhiệm vụ; văn bản đến đơn vị **chủ trì hoặc phối hợp**; lịch họp, chỉ đạo liên quan đơn vị (chỉ xem); bản tin truyền thông (**không** có nút Chỉ đạo) |
| **Mật khẩu quản trị** (đang dùng) | Người cập nhật | Nhập số liệu, Cài đặt, Xuất file |

Dữ liệu của mỗi đơn vị được **khóa riêng** bằng khóa của đơn vị đó: đơn vị này không mở được dữ liệu của đơn vị khác, kể cả khi cố tình. Đơn vị không thấy số liệu của đơn vị khác, chỉ thấy thứ hạng của mình (ví dụ "#3/14").

Danh sách 21 đơn vị: Văn phòng; Phòng QLDN số 1, 2, 3; Phòng CNTK; Phòng Kiểm tra 1, 2; Phòng TCCB; Phòng NVDTPC; Phòng QLRR; Phòng DLRR; Thuế cơ sở 1–10.

## Bước 1. Cập nhật Apps Script (2 phút)
1. Mở Sheet "Bản tin nhanh" → **Tiện ích mở rộng → Apps Script** → xóa hết mã cũ, dán toàn bộ `cong-cu/apps-script-dong-bo.gs` (bản mới) → 💾 Lưu.
2. Chưa làm bước 2 thì để đó; làm xong bước 2 quay lại: ⚙ **Cài đặt dự án → Thuộc tính tập lệnh → Thêm**: `MA_NHAT_KY` = mã nhật ký tạo ở bước 2.
3. **Triển khai → Quản lý các bản triển khai → ✏ → Phiên bản: Phiên bản mới → Triển khai** (địa chỉ giữ nguyên).

## Bước 2. Tạo mã và mật khẩu đơn vị trong app (5 phút, máy quản trị)
1. Mở app bằng **mật khẩu xem** → ⚙ **Cài đặt** (nhập mật khẩu quản trị) → mục **👥 Mật khẩu đơn vị**.
2. Bấm **🎲 Tạo mã gốc** → **📋 Sao chép mã gốc** (dùng ở bước 3).
3. Bấm **🎲 Tạo mã nhật ký** → **📋 Sao chép mã nhật ký** → dán vào Apps Script (bước 1.2).
4. Bấm **🎲 Tạo mật khẩu cho ô còn trống** (hoặc tự gõ; mỗi đơn vị một mật khẩu, ≥ 8 ký tự, khác nhau, khác mật khẩu xem).
5. Bấm **📄 Tạo file khoa_don_vi.json** → tải về.
6. Bấm **🖨 In phiếu giao mật khẩu** → mỗi đơn vị một trang để giao.
7. Kéo xuống mục Google Drive → **📄 Tạo file cau_hinh.json** (file mới chứa thêm mã gốc, đã khóa bằng mật khẩu xem).

> Mã gốc, mật khẩu đơn vị được lưu trên máy quản trị (bấm **💾 Lưu trên máy này**). Không gửi mã gốc cho ai.

## Bước 3. Đưa lên GitHub (5 phút)
1. Kho `bao-cao` → **Settings → Secrets and variables → Actions → New repository secret**: Name `MA_GOC_DON_VI`, Secret: dán **mã gốc** → Add.
2. Kho → **Add file → Upload files** → kéo thả **khoa_don_vi.json** và **cau_hinh.json** (thay file cũ) → **Commit changes**.
3. Tab **Actions** → **Lấy văn bản đến** → **Run workflow**; rồi **Lấy tin tức** → **Run workflow**. Xong sẽ có thư mục `don-vi/` (dữ liệu từng đơn vị, đã khóa).

## Bước 4. Đưa kết quả, thứ hạng cho các đơn vị (mỗi lần cập nhật số liệu)
- Sau khi nhập số liệu và **☁ Xuất file cho Google Drive** như thường lệ, bấm thêm **⬇ Xuất → 👥 Xuất kết quả cho các đơn vị (Drive)** → lưu **Ket_qua_don_vi.json** vào **cùng thư mục Drive** (thay bản cũ).
- File này gồm 21 phần, mỗi phần khóa bằng khóa của một đơn vị. App của lãnh đạo tự bỏ qua file này.

## Bước 5. Kiểm tra
1. Mở link app trên máy khác (hoặc cửa sổ ẩn danh) → nhập **mật khẩu của một Thuế cơ sở**.
2. Đúng khi: dưới tên app có nhãn **👥 Thuế cơ sở …**; chỉ còn 4 tab (**Trang chủ, 7 Kết quả của đơn vị, 8 Văn bản đến, 9 Truyền thông**); không có nút Nhập số liệu, Cài đặt; trang chủ hiện điểm, thứ hạng chung, thứ hạng từng nhiệm vụ; Văn bản đến chỉ có văn bản đơn vị chủ trì, phối hợp; mở một tin không có nút **✍ Chỉ đạo**; lịch họp chỉ xem phân công.
3. Mở lại bằng **mật khẩu xem** → **⬇ Xuất → 📜 Nhật ký đăng nhập, sử dụng**: thấy lượt đăng nhập vừa rồi của đơn vị.

## Nhật ký ghi gì
Thời gian, vai trò (lãnh đạo / đơn vị), đơn vị, hành động (đăng nhập, mở phần, mở lịch họp, mở văn bản đến, xuất, chia sẻ ảnh, phân công, chỉ đạo, khóa app), chi tiết, **mã thiết bị** (mã ngẫu nhiên của từng trình duyệt – nhận ra máy lạ), hệ điều hành, trình duyệt. Số lần **nhập sai mật khẩu** trước khi vào được ghi kèm lần đăng nhập. Nhật ký nằm ở trang **NhatKy** của Sheet; xem, lọc, tải Excel trong app.

## Khi cần thay đổi
- **Đổi mật khẩu một đơn vị** (lộ, đổi người): ⚙ → sửa ô → **Tạo file khoa_don_vi.json** → tải lên GitHub thay file cũ. Mật khẩu cũ hết tác dụng ngay.
- **Nghi lộ mã gốc**: 🎲 Tạo mã gốc mới → làm lại bước 2–4 (đặt lại secret, file mới, xuất lại kết quả).
- **Đổi mật khẩu xem của lãnh đạo**: như cũ; mật khẩu đơn vị không bị ảnh hưởng.

## Lưu ý an toàn
- Mỗi đơn vị giữ mật khẩu riêng, không gửi qua nhóm chung. Máy dùng chung: bỏ chọn "Nhớ trên máy này", dùng xong bấm 🔒.
- Văn bản mật không đưa vào dữ liệu đơn vị.
- Đơn vị phối hợp được xác định theo cột "Phối hợp" trên Sổ theo dõi; "các phòng", "các Thuế cơ sở", "các đơn vị" được hiểu là tất cả đơn vị thuộc nhóm đó.
