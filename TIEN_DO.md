# TIẾN ĐỘ – App Báo cáo điều hành

> Kho công khai: chỉ ghi chức năng và quyết định. **Không ghi số liệu thật.**

## 1. Chức năng đã có
- **Trang chủ:** nền sáng, 6 nhiệm vụ trên vòng tròn, mỗi nhiệm vụ một màu, số chạy khi mở, ô hiện dần; chỉ số chính, nút chuyển phần nhanh ▦, thanh Tab. Trang chủ của đơn vị cùng kiểu: giữa là thứ hạng chung, quanh là từng nhiệm vụ (thứ hạng + tỷ lệ chính), chạm để xem chi tiết.
- **Cổng mật khẩu** khi mở qua web; mật khẩu xem khóa số liệu; mật khẩu quản trị cho Nhập, Cài đặt, Xuất.
- **Phần 1. Thu NSNN:** A. theo khoản thu, đơn vị (có Hải quan); B. dự toán 99 xã, phường: bản đồ, tìm xã, top 10, lọc theo Thuế cơ sở, mẫu biểu nhập, **màn hình điều hành toàn màn hình**.
- **Phần 2.** Chiến dịch làm sạch MST 03, 06.
- **Phần 3.** Sự hài lòng NNT: A. tiến độ cỡ mẫu (Mẫu 01); B. theo dõi điều hành (Mẫu 02–05).
- **Phần 4.** Kiểm tra tại trụ sở NNT, có tỷ lệ hoàn thành kế hoạch phê duyệt.
- **Phần 5.** Kiểm tra tại trụ sở CQT.
- **Phần 6.** Công tác nợ, đánh giá theo mục tiêu Cục Thuế (8%, 5%).
- **Phần 7.** Tổng hợp đơn vị: sơ đồ bộ máy, chi tiết đơn vị, nhiệm vụ từ văn bản đến, lịch tuần.
- **Thanh Tab:** 10 tab một hàng (7 Tổng hợp đơn vị, 8 Văn bản đến, 9 Truyền thông), không đủ chỗ tự dùng tên ngắn.
- **Lịch họp:** nút 🗓 ở Trang chủ và thanh trên (chấm đỏ = cuộc họp mới, nhấp nháy khi còn ≤ 2 giờ); gộp họp từ văn bản đến + trang LichHop; phân công lãnh đạo dự (Trưởng, Phó Trưởng trang LĐ), đơn vị chủ trì chuẩn bị, phối hợp, chỉ đạo nhanh; ảnh thông báo gửi Zalo/mail; .ics.
- **Phần 9. Thông tin truyền thông:** tin từ Sheet "Bản tin nhanh" (tác vụ `lay-tin-tuc.yml` 2 giờ/lần, đã khóa); điểm tin, thống kê, lọc; đánh giá của tác vụ AI (trang DanhGia) hoặc phân loại sơ bộ theo từ khóa; nút Chỉ đạo → trang Chidao; ảnh Phiếu chỉ đạo, ảnh Điểm tin.
- **Mật khẩu đơn vị** (21 phòng, Thuế cơ sở): mỗi đơn vị chỉ thấy kết quả, thứ hạng của mình, văn bản chủ trì/phối hợp, lịch họp, chỉ đạo liên quan, bản tin (không chỉ đạo). **Nhật ký đăng nhập, sử dụng** (⬇ Xuất → 📜).
- **Đồng bộ Google Sheet** qua Apps Script (`cong-cu/apps-script-dong-bo.gs`): ghi LichHop, Chidao; chưa cài thì lưu trên máy. Phần 7 hiện chỉ đạo, cuộc họp giao đơn vị.
- **Văn bản đến:** thẻ số bấm để lọc, Danh sách, Điều hành nhanh, Báo cáo nhanh, Hôm nay cần làm, Lịch họp (có tệp .ics), Lịch hạn, Ma trận ưu tiên, Theo đơn vị, Thống kê; tự kiểm tra 2 phút/lần, báo văn bản mới.
- Chung: xuất Ảnh, PDF, Excel, bản chia sẻ, sao lưu; thu gọn nội dung dài; giao diện điện thoại; đọc số liệu trực tuyến từ Google Drive.

## 2. Nhật ký
- 21/11/2026: **Chuyển mã nguồn về kho này** làm nguồn gốc duy nhất cho mọi máy. Thêm `dong_goi.py`, tác vụ tự đóng gói `dong-goi.yml`, `CLAUDE.md`, `TIEN_DO.md`, `.nojekyll`. Từ nay không tải `index.html`, `van-ban-den.html` lên bằng tay.

- 21/11/2026: Sửa thanh Tab; thêm Lịch họp (phân công, chỉ đạo, ảnh chia sẻ), Phần 9 Thông tin truyền thông, đồng bộ Google Sheet, tác vụ Lấy tin tức, hướng dẫn `HUONG_DAN_DONG_BO_SHEET.md`, `tac-vu/danh-gia-tin-tuc.md`. Tên cơ quan giữ "Thuế thành phố Bắc Ninh" (người dùng chốt lại 21/11/2026); danh sách lãnh đạo phó lấy chức vụ "Phó Trưởng…" ở trang LĐ.

- 21/11/2026: Chế độ đơn vị: ẩn thông tin quản trị (tự kiểm tra, Lấy ngay, hướng dẫn cài đặt); thêm Trung tâm điều hành thu NSNN cho Thuế cơ sở (xã, phường phụ trách) và Phòng CNTK, NVDTPC (toàn bộ); trang chủ đơn vị thiết kế lại (màu theo nhiệm vụ, chữ, số lớn).
- 21/11/2026: Thêm mật khẩu riêng cho 21 đơn vị (khoa_don_vi.json, thư mục don-vi/, Ket_qua_don_vi.json trên Drive), nhật ký đăng nhập; hướng dẫn `HUONG_DAN_MAT_KHAU_DON_VI.md`.

- 21/11/2026: Trang chủ chuyển sang nền sáng, màu riêng từng nhiệm vụ (lãnh đạo và đơn vị); trang chủ đơn vị làm lại theo kiểu vòng chức năng, chỉ hiện thứ hạng và tỷ lệ chính; hiệu ứng dùng được trên iPhone, Android (có tiền tố -webkit-, không dùng tính năng mới).
- 21/11/2026: Ước tính token khi app tự chạy (1 lần đo mỗi tác vụ): đánh giá tin (3 lần/ngày) ≈ 1,6 triệu token/lần; quét văn bản đến (4 lần/ngày) ≈ 2,5 triệu token/lần; tổng ≈ 14–15 triệu token/ngày, phần lớn là đọc lại ngữ cảnh đã lưu (giá rẻ). Các tác vụ GitHub (lấy tin, lấy văn bản, đóng gói) và app trên trình duyệt không tốn token.
- 21/11/2026: Giảm chi phí tác vụ AI: đánh giá tin chuyển sang Sonnet, 2 lần/ngày (7:42, 14:42), tối đa 40 tin/lần, thêm yêu cầu tự kiểm tra số hiệu, ngày, con số; quét văn bản đến (Sonnet) bỏ lần 23:40, còn 9:40, 12:40, 16:40. Ước tính còn ≈ 9–10 triệu token/ngày (≈ 3,5–4 USD theo giá công khai). Lịch dự phòng của "Lấy văn bản đến" đổi theo giờ quét mới.
## 3. Việc còn lại (người dùng làm trên GitHub)
- [ ] Làm theo `huong-dan/HUONG_DAN_MAT_KHAU_DON_VI.md`: dán Apps Script mới + `MA_NHAT_KY`; tạo mã gốc, mật khẩu đơn vị; secret `MA_GOC_DON_VI`; tải `khoa_don_vi.json`, `cau_hinh.json`; xuất kết quả đơn vị lên Drive.
- [ ] Làm theo `huong-dan/HUONG_DAN_DONG_BO_SHEET.md`: secret `SHEET_TIN_TUC_ID`; cài Apps Script, đặt `MA_BI_MAT`; nhập vào ⚙ Cài đặt, tạo lại `cau_hinh.json`.
- [x] 21/11/2026: đã nối Google Sheets (Composio), tạo trang **DanhGia**, tạo tác vụ đã lên lịch riêng **“Đánh giá tin thuế (Phần 9 – Thông tin truyền thông)”** chạy 7h42, 12h42, 16h42.
- [ ] **Dán lại `cong-cu/apps-script-dong-bo.gs` vào Apps Script, triển khai Phiên bản mới** (bản sửa 21/11/2026: cột có danh sách thả xuống như Lãnh đạo chủ trì, Phòng chủ trì tự chọn mục khớp, bản đầy đủ ghi cột “Lãnh đạo dự (app)”, “Đơn vị chuẩn bị (app)”).
- [x] 21/11/2026: đã gắn connector Composio cho tác vụ “Đánh giá tin thuế”; chạy thử ghi được 30 đánh giá vào trang DanhGia.
- [ ] Đóng yêu cầu gộp số 1 (nhánh `claude/cool-pasteur-yjowui`), **không Merge**: bản cũ.
- [ ] Bước 7 trong `huong-dan/HUONG_DAN_TRUC_TUYEN.md`: để Sổ theo dõi báo sang ngay khi có văn bản mới.
- [ ] Ghi lịch gia hạn mã `VANBAN_TOKEN`. Đổi mật khẩu xem thì đổi cả secret `MAT_KHAU_XEM`.

## 4. Cần xác nhận
- Hướng dẫn sử dụng chưa mô tả đủ cổng mật khẩu, Phần 7, Điều hành nhanh, Báo cáo nhanh.
- Khuôn dạng một số trường văn bản đến (trạng thái, lĩnh vực, giờ họp) suy ra từ trang cũ; đối chiếu khi gặp hiển thị sai.
