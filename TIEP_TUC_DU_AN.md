# TIẾP TỤC DỰ ÁN

## 1. Phạm vi
Repo: `hmtnvac-cpu/M3u-sports-`

Đây là file ghi nhớ trạng thái làm việc để có thể mở repo và tiếp tục ngay, không phải README và không phải tài liệu bàn giao cho người khác.

## 2. Thời gian làm việc đã ghi nhận
- Mốc GitHub liên quan đến LIVE bắt đầu: 2026-08-20.
- Mốc làm việc đã xác định rõ trong các phiên: 2026-08-24 trở đi.
- Cập nhật công việc gần nhất trước file này: 2026-09-07.

## 3. Mục tiêu dự án
Danh sách/kênh thể thao M3U và catalog LIVE, kết hợp dữ liệu trận đấu, stream, logo/badge và kiểm tra chất lượng stream để phục vụ hệ sinh thái Nuvio/Troll.

## 4. Đã thực hiện
### LIVE / lịch thi đấu
- Tạo và duy trì `live.json`.
- Cập nhật LIVE theo ngày.
- Dọn các trận đã hoàn thành.
- Loại các trận không thuộc phạm vi Premier League khi cần.
- Cập nhật các cửa sổ LIVE Premier League ngày 25/08, 28/08, 03/09, 05/09, 06/09 và 07/09/2026.
- Khi không có trận Premier League, đã có logic ẩn LIVE catalogs.

### Kênh / stream
- Duy trì dữ liệu kênh thể thao.
- Có module `tnt-channels.js` cho TNT.
- Có kiểm tra stream và xếp hạng stream.
- Có dữ liệu `stream-health.json`.

### Badge / logo
- Cập nhật sự kiện Peacock dùng shared 2026 logo.
- Có mapping `nuvio-troll-badges.json` và thư mục `troll-badges/`.
- Duy trì badge/logo phục vụ hiển thị Nuvio/Troll.

### Automation
- Đã thêm daily stream health check; workflow kiểm tra stream chạy trước cửa sổ cập nhật LIVE buổi sáng.
- Có GitHub Actions trong `.github/workflows/`.

## 5. Các mốc quan trọng đã xác minh
- `7d4ffa4d...` — tạo `live.json` (20/08/2026).
- `915cdaf8...` — cập nhật Peacock events dùng shared 2026 logo (24/08/2026).
- `dc86eaaf...` — clear LIVE đã hoàn thành (25/08/2026).
- `52c3e55c...` — cập nhật LIVE schedule 25/08.
- `6f1fc0e3...` — thêm daily stream health check (25/08).
- `9f1bca93...` — ẩn LIVE catalogs khi không có Premier League (26/08).
- `50669a7b...` — thêm EPL match vào cửa sổ 28/08.
- `0a6a4969...` — cập nhật LIVE 03/09.
- `c0785ba6...` — cập nhật Premier League LIVE 05/09.
- `a72c4eab...` — cập nhật Premier League LIVE 06/09.
- `422a2faa...` — cập nhật Premier League LIVE 07/09.

## 6. Luồng / file chính
- `index.js` — logic chính của addon/API và cách dữ liệu được tiêu thụ.
- `channels.js` — dữ liệu/cấu hình kênh.
- `bootstrap.js` — bootstrap.
- `tnt-channels.js` — TNT channels.
- `live.json` — nguồn lịch LIVE.
- `stream-health.json` — kết quả health.
- `scripts/check-streams.js` — kiểm tra stream.
- `scripts/rank-streams.js` — xếp hạng stream.
- `nuvio-troll-badges.json` — mapping badge.
- `troll-badges/` — tài nguyên badge.
- `.github/workflows/stream-health.yml` — automation health.
- `package.json` — Node.js config.

## 7. Trạng thái hiện tại
- Repo vẫn có logic kênh, LIVE, stream health và badge.
- `live.json` hiện tại là file rỗng 3 bytes; không tự coi đây là lỗi.
- Công việc cập nhật LIVE đang **tạm dừng theo lệnh người dùng**.

## 8. Quy tắc khóa
- **Không tự động cập nhật `live.json`.**
- Không tự động kiểm tra rồi sửa LIVE.
- Chỉ cập nhật lịch khi người dùng ra lệnh mới.
- Giữ nguyên format dữ liệu mà `index.js` đang đọc.
- Không xóa kênh/logo/badge hoặc module chỉ vì nhìn có vẻ không dùng.
- Không tự ý đổi production URL/deploy/config.

## 9. Công việc định kỳ khi được phép tiếp tục
1. Đọc file này.
2. Kiểm tra `index.js`, `channels.js`, `live.json` và workflow.
3. Nếu người dùng yêu cầu cập nhật LIVE thì mới cập nhật.
4. Nếu yêu cầu health thì chạy/kiểm tra health theo workflow hiện tại.
5. Kiểm tra ảnh hưởng đến catalog và badge trước khi thay đổi cấu trúc.

## 10. Việc đang chờ
Chờ lệnh mới của người dùng. Không có nhiệm vụ tự động nào được phép chạy tiếp chỉ vì lịch cũ từng được cập nhật hàng ngày.

## 11. Cập nhật file
2026-09-08 — hoàn thiện file `TIEP_TUC_DU_AN.md`, bổ sung lịch sử, cấu trúc, các mốc kỹ thuật và quy tắc khóa hiện hành.
