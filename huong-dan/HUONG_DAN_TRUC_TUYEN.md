# Đưa báo cáo lên mạng: mở bằng link, tự cập nhật từ Google Drive

## Cách hoạt động
| Thành phần | Ở đâu | Làm gì |
|---|---|---|
| **Trang web (app)** | GitHub Pages, miễn phí | Mọi người mở bằng link `https://<tên>.github.io/bao-cao/` |
| **File số liệu** | 1 thư mục Google Drive chia sẻ | Chỉ để 1 file `Sao_luu_bao_cao_dieu_hanh.json`, mỗi lần có số mới thì ghi đè |
| **Khóa API Google** | Google Cloud, miễn phí | Cho trang web được **đọc** thư mục Drive (không sửa, không xóa được gì) |

Khi mở link, app tự đọc file mới nhất trong thư mục Drive. Trong lúc đang mở, app tự kiểm tra lại khoảng 5 phút một lần, và kiểm tra ngay khi quay lại app.

Làm theo thứ tự **Bước 1 → 5**. Chỉ cần làm một lần, mất khoảng 30–40 phút.

---

## Bước 1. Tạo thư mục Google Drive và chia sẻ
1. Vào **drive.google.com**, bấm **+ Mới → Thư mục mới**, đặt tên `So lieu bao cao dieu hanh`. Nên tạo trong **Drive của tôi**, không tạo trong "Máy tính khác".
2. Trên máy tính, mở app (file `Bao_cao_dieu_hanh_Thue_TP_Bac_Ninh.html`), bấm **⬇ Xuất → ☁ Xuất file cho Google Drive** và lưu file `Sao_luu_bao_cao_dieu_hanh.json`.
3. Kéo file đó vào thư mục vừa tạo trên Drive.
4. Bấm chuột phải vào thư mục, chọn **Chia sẻ → Chia sẻ**:
   - Ở mục **Quyền truy cập chung**, chọn **Bất kỳ ai có đường liên kết**, vai trò **Người xem**.
   - Bấm **Sao chép đường liên kết → Xong**.
5. Ghi lại link này, có dạng `https://drive.google.com/drive/folders/1Abc…`.

## Bước 2. Đưa app lên GitHub Pages
1. Vào **github.com**, bấm **Sign up**, nhập email, mật khẩu, **tên người dùng**, rồi xác nhận email.
   Tên người dùng sẽ nằm trong địa chỉ trang. Ví dụ tên `baocao-bn` thì trang là `https://baocao-bn.github.io/bao-cao/`.
2. Bấm dấu **+** ở góc trên bên phải, chọn **New repository**:
   - Repository name: `bao-cao`
   - Chọn **Public** (GitHub Pages miễn phí chỉ dùng được với kho công khai).
   - Tích **Add a README file**, rồi bấm **Create repository**.
3. Trong kho vừa tạo, bấm **Add file → Upload files**. Kéo file **`index.html`** trong thư mục
   của app vào, rồi bấm **Commit changes**. (Kho hiện tại đã có sẵn, GitHub tự đóng gói.)
4. Bấm tab **Settings → Pages** (menu bên trái). Ở mục **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**, thư mục **/ (root)**
   - Bấm **Save**.
5. Đợi 1–3 phút rồi tải lại trang **Settings → Pages**. Khi thấy dòng *"Your site is live at https://<tên>.github.io/bao-cao/"* thì đây chính là **link cho mọi người**.

> Kho để chế độ công khai nên ai cũng xem được **mã của app**. Trong mã **không có số liệu**; số liệu chỉ nằm trên Drive.

## Bước 3. Tạo khóa API Google (chỉ đọc)
1. Vào **console.cloud.google.com** và đăng nhập Google (dùng chính tài khoản Drive ở Bước 1 cũng được). Lần đầu vào sẽ được hỏi quốc gia: chọn Việt Nam và đồng ý điều khoản.
2. Bấm ô chọn dự án ở thanh trên cùng, chọn **Dự án mới (New project)**, đặt tên `bao-cao-dieu-hanh`, bấm **Tạo**. Tạo xong thì chọn dự án đó.
3. Gõ **Google Drive API** vào ô tìm kiếm trên cùng, mở kết quả rồi bấm **Bật (Enable)**.
4. Bấm menu ☰, chọn **API và dịch vụ → Thông tin xác thực (Credentials)**, rồi **+ Tạo thông tin xác thực → Khóa API (API key)**. Khóa hiện ra có dạng `AIza…`: **sao chép** lại.
5. Bấm vào tên khóa (hoặc **Chỉnh sửa khóa API**) để giới hạn khóa:
   - **Hạn chế ứng dụng**: chọn **Trang web (Websites)**, bấm **Thêm**, nhập `https://<tên>.github.io/*` (thay `<tên>` bằng tên người dùng GitHub).
   - **Hạn chế API**: chọn **Hạn chế khóa**, tích **Google Drive API**.
   - Bấm **Lưu**. Đợi khoảng 5 phút để khóa có hiệu lực.

Không cần thẻ thanh toán. Nếu trang mời dùng thử hoặc thêm thanh toán thì bỏ qua.

## Bước 4. Kết nối app với Drive và đưa cấu hình lên GitHub
1. Trên máy tính, mở **link trang web** ở Bước 2. Phải mở bằng link, không mở file trên máy, vì khóa chỉ cho phép địa chỉ trang web.
2. Bấm **⚙ Cài đặt**, tìm mục **Nguồn số liệu trực tuyến (Google Drive)**:
   - Dán **link thư mục** (Bước 1) và **khóa API** (Bước 3).
   - Bấm **🔌 Thử kết nối**. Thấy *"✅ Kết nối được. File mới nhất: Sao_luu_bao_cao_dieu_hanh.json…"* là đúng.
3. Bấm **📄 Tạo file cau_hinh.json**. Máy sẽ tải về file `cau_hinh.json`.
4. Vào kho `bao-cao` trên GitHub, bấm **Add file → Upload files**, kéo file `cau_hinh.json` vào, rồi bấm **Commit changes**.
5. Đợi 1–2 phút rồi tải lại trang web. Đầu trang phải có **thanh xanh "🌐 Số liệu trực tuyến (Google Drive) – file cập nhật lúc …"**.

Nếu **Thử kết nối** báo lỗi:
| Thông báo | Cách sửa |
|---|---|
| Khóa API không đúng | Sao chép lại khóa, không thừa dấu cách |
| Chưa bật "Google Drive API" | Làm lại Bước 3, mục 3 |
| Khóa API không cho phép địa chỉ trang này | Kiểm tra dòng `https://<tên>.github.io/*` ở Bước 3, mục 5; đợi 5 phút |
| Không thấy thư mục/file | Kiểm tra link thư mục và quyền "Bất kỳ ai có đường liên kết" |
| Thư mục Drive chưa có file .json | Làm lại Bước 1, mục 2–3 |

## Bước 5. Dùng trên điện thoại
1. Gửi **link trang web** cho lãnh đạo, cán bộ (qua Zalo, email…).
2. Mở link bằng **Chrome**, bấm **⋮ → Thêm vào màn hình chính** để có biểu tượng như một ứng dụng.
3. Mỗi lần mở là thấy số mới nhất. Muốn lấy ngay thì bấm **↻ Lấy số mới** trên thanh xanh.

---

## Cập nhật số liệu hằng ngày, hằng tuần (người cập nhật)
1. Trên máy tính, mở app (link trang web hoặc file trên máy), bấm **⬆ Nhập**, kéo file Excel vào, rồi bấm **💾 Lưu thay đổi**.
   Nếu đang xem bản trực tuyến, số mới được **gộp vào bản trên Drive**, nên không cần giữ số liệu trên máy.
2. Bấm **⬇ Xuất → ☁ Xuất file cho Google Drive** và lưu file `Sao_luu_bao_cao_dieu_hanh.json`.
3. Đưa file lên thư mục Drive, **thay file cũ**, bằng một trong hai cách:
   - **Cách 1 (tiện nhất):** cài **Google Drive cho máy tính**. Thư mục Drive sẽ hiện như một ổ đĩa (ví dụ `G:\My Drive\So lieu bao cao dieu hanh`). Ở mục 2, lưu thẳng file vào đó và chọn **Thay thế (ghi đè)**; file sẽ tự đồng bộ lên mạng.
   - **Cách 2:** vào drive.google.com, mở thư mục, xóa file cũ rồi kéo file mới vào. Hoặc bấm chuột phải vào file cũ, chọn **Thông tin tệp → Quản lý phiên bản → Tải phiên bản mới lên**.
4. Các điện thoại tự nhận số mới trong khoảng 5 phút, hoặc ngay khi mở lại app.

App luôn lấy **file .json mới nhất** trong thư mục. Nếu lỡ có 2 file thì vẫn đúng, nhưng nên giữ 1 file cho gọn.

## Khi có bản app mới
Không cần tải tệp lên nữa. Khi mã nguồn trên nhánh `main` thay đổi, tác vụ **Đóng gói app** tự tạo lại `index.html`, `van-ban-den.html`. Không đụng vào `cau_hinh.json`, `van-ban-den.mahoa.json`.

Sau khi đóng gói xong, đợi 1–2 phút rồi mở link, bấm **Ctrl + F5** (máy tính) để lấy bản mới. Trên điện thoại: đóng hẳn tab cũ rồi mở lại link; nếu vẫn bản cũ thì kéo trang xuống để tải lại.

Số liệu trên Drive vẫn dùng được với bản mới. Phần mới chưa có số thì hiện "chưa có số liệu" cho đến khi bạn nhập biểu và xuất lại file cho Drive.

## Bước 6. Khóa số liệu bằng mật khẩu (nên làm)
Có 2 mật khẩu:
- **Mật khẩu xem**: khóa file số liệu trên Drive và file `cau_hinh.json` (trong đó có link Drive và khóa API). Báo mật khẩu này cho lãnh đạo, cán bộ được xem.
- **Mật khẩu quản trị**: chỉ người cập nhật biết. Phải nhập mới mở được **Nhập số liệu, ⚙ Cài đặt, Xuất file cho Google Drive, Sao lưu/Khôi phục, Bản chia sẻ**.

Mỗi mật khẩu dài ít nhất 8 ký tự, và 2 mật khẩu phải khác nhau.

Các bước làm:
1. Mở link trang web. Bấm **⚙ Cài đặt**, tìm mục **Bảo mật**:
   - Nhập **Mật khẩu xem** và **Mật khẩu quản trị**.
   - Bấm **💾 Lưu mật khẩu cho máy này**.
2. Cũng trong Cài đặt, ở mục **Nguồn số liệu trực tuyến** (link và khóa đã điền sẵn), bấm **📄 Tạo file cau_hinh.json**. File tải về đã được khóa.
3. Tải `cau_hinh.json` mới lên GitHub, thay file cũ: **Add file → Upload files → Commit changes**.
4. Bấm **⬇ Xuất → ☁ Xuất file cho Google Drive**. File xuất ra đã khóa; chép đè lên thư mục Drive.
5. Báo **mật khẩu xem** cho mọi người.
   - Lần đầu mở link, mỗi người nhập mật khẩu xem và tích **Nhớ trên máy này**.
   - Muốn chặn ai, đổi mật khẩu xem rồi làm lại các bước 2–5.

Các file mở bằng Notepad lúc này chỉ còn chuỗi ký tự vô nghĩa. Người lấy được link Drive, khóa API hay xem kho GitHub cũng **không đọc được số liệu**.

Lưu ý:
- **Quên mật khẩu xem thì không mở được file đã khóa.** Hãy ghi mật khẩu vào nơi an toàn.
- Máy của người quản trị có lưu mật khẩu xem để mỗi lần xuất tự khóa. Không dùng máy dùng chung cho việc này.
- Việc khóa Cài đặt bằng mật khẩu quản trị là để người xem không tình cờ thấy hay sửa cấu hình. Quyền **sửa số liệu thật sự** nằm ở tài khoản Google Drive của bạn, vì chỉ bạn ghi đè được file.

## Bước 7. Văn bản đến cập nhật ngay (khi Sổ theo dõi quét theo lịch hoặc quét gấp)
Cách làm: mỗi khi kho riêng tư **theo-doi-van-ban** có tệp `xuat/van-ban-den.json` mới (quét 9:40, 12:40, 16:40 hoặc quét thủ công), kho đó **gọi ngay** tác vụ "Lấy văn bản đến" của kho trang báo cáo. Khoảng 1–3 phút sau trang Văn bản đến có số mới; trang tự kiểm tra 2 phút/lần và hiện thông báo "🔔 Có n văn bản mới". Tác vụ vẫn tự chạy dự phòng 15 phút sau mỗi lần quét và mỗi giờ trong giờ làm việc.

Hai tệp đã soạn sẵn trong thư mục `huong-dan/tac-vu/` của kho.

**7.1. Kho trang báo cáo (tpbacninh-baocao/bao-cao): thay tệp tác vụ**
1. Mở kho trên GitHub → thư mục `.github/workflows` → bấm tệp `lay-van-ban-den.yml` → bấm biểu tượng bút chì (Edit).
2. Xóa hết nội dung, dán toàn bộ nội dung tệp `huong-dan/tac-vu/lay-van-ban-den.yml` → **Commit changes**.

**7.2. Tạo mã gọi (chỉ dùng để "bấm chạy" tác vụ, không đọc được dữ liệu)**
1. GitHub (tài khoản quản trị) → ảnh đại diện → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Token name: `goi-lay-van-ban-den`. Expiration: 1 năm (ghi lịch nhắc gia hạn).
3. **Resource owner**: chọn tổ chức `tpbacninh-baocao` (nếu không thấy: vào tổ chức → Settings → Personal access tokens → cho phép fine-grained tokens).
4. **Repository access**: *Only select repositories* → chọn `bao-cao`.
5. **Permissions → Repository permissions → Actions**: *Read and write*. Không chọn quyền nào khác.
6. **Generate token** → sao chép mã (chỉ hiện một lần).

**7.3. Kho riêng tư theo-doi-van-ban: đặt mã và thêm tác vụ báo**
1. Kho `theo-doi-van-ban` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**: Name `BAOCAO_DISPATCH_TOKEN`, Secret: dán mã ở 7.2 → **Add secret**.
2. Kho `theo-doi-van-ban` → **Add file** → **Create new file** → gõ tên `.github/workflows/bao-app-dieu-hanh.yml` → dán nội dung tệp `huong-dan/tac-vu/bao-app-dieu-hanh.yml` của kho `bao-cao` → **Commit changes** (vào nhánh main).
   Có thể nhờ phiên Claude của dự án theo-doi-van-ban thêm tệp này; nhắc nó **không sửa** tệp, chỉ thêm.

**7.4. Thử**
1. Kho `theo-doi-van-ban` → **Actions** → "Báo app điều hành có văn bản mới" → **Run workflow**. Đúng: dấu ✓ xanh.
2. Kho `bao-cao` → **Actions**: trong vài giây có lượt chạy mới "Lấy văn bản đến" (sự kiện *workflow_dispatch*), xong dấu ✓.
3. Mở trang Văn bản đến, bấm **↻ Làm mới**. Dòng trên cùng ghi "Quét lúc … · về app lúc …" là giờ mới.
4. Lần quét kế tiếp của Sổ theo dõi: 1–3 phút sau, trang hiện "🔔 Có n văn bản mới" (nếu có văn bản mới).

Lỗi thường gặp: tác vụ báo bị đỏ "Bad credentials" / "Resource not accessible" → mã ở 7.2 sai, hết hạn hoặc thiếu quyền Actions; nhánh chính của bao-cao không phải `main` → sửa `"ref":"main"` trong tệp báo. Trên trang Văn bản đến (mở bằng link github.io) có liên kết nhỏ **⚙ Lấy ngay (quản trị)** dẫn tới chỗ bấm Run workflow.

## An toàn
- Chưa làm Bước 6 thì **ai có link trang web là xem được số liệu**. Làm Bước 6 rồi thì người xem còn cần thêm mật khẩu xem.
- Muốn **chặn ngay**: đổi quyền chia sẻ thư mục Drive về **Bị hạn chế**. Mọi người sẽ thôi đọc được số mới; chỉ còn bản đã lưu trên máy của từng người.
- Khóa API chỉ **đọc** được file đã chia sẻ, và chỉ dùng được từ trang của bạn. GitHub có thể gửi email báo "phát hiện khóa Google trong kho". Việc này bình thường vì khóa đã được giới hạn.
- Kho GitHub vẫn giữ lịch sử các file cũ, gồm cả `cau_hinh.json` cũ chưa khóa (có khóa API). Sau Bước 6 nên **đổi khóa API**: trong Google Cloud bấm **Rotate key** ở trang khóa, rồi làm lại Bước 6 mục 2–3 với khóa mới.
- Bật **xác minh 2 bước** cho tài khoản Google và GitHub.
