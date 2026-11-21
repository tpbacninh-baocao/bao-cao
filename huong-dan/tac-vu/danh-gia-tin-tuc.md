# Hướng dẫn cho tác vụ AI: đánh giá nhanh tin về thuế

Dán **toàn bộ phần trong khung dưới** vào cuối nội dung của tác vụ đã lên lịch (tác vụ đang thu thập tin vào trang `Sheet1` của Google Sheet "Bản tin nhanh"). Tác vụ cần quyền **sửa** Sheet đó.

> Đang dùng (21/11/2026): tác vụ riêng "Đánh giá tin thuế", mô hình **Sonnet**, chạy **2 lần/ngày** (7:42 và 14:42 giờ Việt Nam), tối đa 40 tin mỗi lần. Không cần Opus: việc đọc bài, tóm tắt, phân loại theo mẫu Sonnet làm tốt, tốn khoảng 1/2 so với Opus.

```
SAU KHI THU THẬP TIN, ĐÁNH GIÁ NHANH CÁC TIN MỚI
Vai trò: chuyên viên tổng hợp của cơ quan thuế, tham mưu cho lãnh đạo Thuế (cấp tỉnh, thành phố).

1. Mở Google Sheet "Bản tin nhanh". Nếu chưa có trang "DanhGia" thì tạo trang đó với hàng tiêu đề đúng thứ tự:
   link | Mức độ | Loại tin | Chính thống | Tóm tắt | Căn cứ | Trích dẫn | Hiệu lực | Ảnh hưởng NNT | Việc CQT phải làm | Đề xuất đơn vị | Hạn đề xuất | Từ khóa | Đánh giá lúc
2. Lấy các tin ở trang "Sheet1" có ngày (cột date) trong 3 ngày gần nhất mà cột link CHƯA có trong trang "DanhGia".
   Ưu tiên tin type "noibo", nguồn .gov.vn, chinhphu.vn, quochoi.vn, mof.gov.vn, gdt.gov.vn; tối đa 40 tin mỗi lần.
3. Với mỗi tin: mở link, đọc bài. Không mở được thì chỉ dựa vào tiêu đề và ghi "Chưa đọc được bài gốc" ở cột Tóm tắt.
4. Ghi MỘT dòng vào "DanhGia" cho mỗi tin, cột link chép nguyên link ở Sheet1. Nội dung các cột:
   - Mức độ: đúng một trong 3 giá trị: Rất quan trọng | Quan trọng | Tham khảo
     (Rất quan trọng = chính sách, văn bản pháp luật mới / chỉ đạo của Quốc hội, Chính phủ, Bộ Tài chính, Cục Thuế
      có tác động trực tiếp tới công tác thuế hoặc người nộp thuế trên địa bàn, có thời hạn cần triển khai).
   - Loại tin: đúng một trong 5 giá trị: Chính sách mới | Chỉ đạo ngành | Xử lý vi phạm | Hướng dẫn nghiệp vụ | Dư luận – báo chí
   - Chính thống: Có (nguồn cơ quan nhà nước, cổng thông tin chính thức, báo của cơ quan nhà nước) hoặc Không.
   - Tóm tắt: 2–4 câu, nêu nội dung chính, đối tượng áp dụng, con số quan trọng.
   - Căn cứ: số hiệu, ngày ban hành văn bản, điều khoản liên quan (nếu bài có nêu). Không bịa số hiệu.
   - Trích dẫn: 1 câu trích nguyên văn quan trọng nhất trong bài (nếu có).
   - Hiệu lực: ngày hiệu lực, thời hạn, mốc thời gian cần lưu ý.
   - Ảnh hưởng NNT: người nộp thuế nào bị ảnh hưởng, ảnh hưởng thế nào (thủ tục, nghĩa vụ, chi phí, quyền lợi).
   - Việc CQT phải làm: 2–4 việc cụ thể cơ quan thuế phải triển khai (phổ biến, rà soát, hướng dẫn, kiểm tra, báo cáo…).
   - Đề xuất đơn vị: đơn vị chủ trì đề xuất, dùng đúng tên: Văn phòng; Phòng Quản lý, hỗ trợ doanh nghiệp số 1/2/3;
     Phòng CNTK; Phòng Kiểm tra 1/2; Phòng Nghiệp vụ – Dự toán – Pháp chế; Thuế cơ sở 1…10 (hoặc "các Thuế cơ sở").
   - Hạn đề xuất: dd/mm/yyyy nếu cần triển khai trước một mốc; để trống nếu không có.
   - Từ khóa: 3–6 từ khóa, cách nhau dấu phẩy.
   - Đánh giá lúc: thời điểm đánh giá, dạng dd/mm/yyyy hh:mm.
5. Viết tiếng Việt, ngắn gọn, khách quan; chỉ dựa vào nội dung bài, không suy đoán. Không ghi thông tin cá nhân,
   mã số thuế của người nộp thuế vào Sheet.
6. Không sửa, không xóa dữ liệu ở các trang khác (Sheet1, LĐ, LichHop, Chidao).
```

## App hiển thị thế nào
- Tác vụ GitHub **"Lấy tin tức"** (2 giờ/lần) chép cả trang `DanhGia` về app (đã khóa). Muốn thấy ngay: tab **Actions → Lấy tin tức → Run workflow**.
- Tin đã đánh giá: hiện đủ các mục, nhãn **"Đã đánh giá (AI)"**. Tin chưa đánh giá: nhãn **"sơ bộ"**, app tự phân loại theo từ khóa.
