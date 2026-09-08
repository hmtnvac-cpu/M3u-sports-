# TIẾP TỤC DỰ ÁN

## Phạm vi lịch sử
Dự án này là repo `hmtnvac-cpu/M3u-sports-`. Nội dung dưới đây được tổng hợp từ lịch sử làm việc đã có, trạng thái repo hiện tại và các commit đã ghi nhận trên GitHub. Nếu có điểm chưa thể xác minh từ repo, không được tự suy đoán; coi đó là mục cần kiểm tra.

## Thời gian làm việc đã ghi nhận
- Bắt đầu: 2026-08-24
- Cập nhật cuối đã ghi nhận: 2026-09-07

## Mục đích
Repo phục vụ hệ thống danh sách/kênh thể thao M3U và dữ liệu LIVE, gồm dữ liệu kênh, lịch sự kiện, logo/badge và kiểm tra sức khỏe stream. Repo có liên hệ với hệ sinh thái Nuvio/Troll đã được xây dựng trong các phiên làm việc trước.

## Những việc đã làm
- Thiết lập/cập nhật dữ liệu kênh thể thao.
- Duy trì `live.json` cho lịch LIVE.
- Cập nhật lịch Premier League theo từng ngày.
- Cập nhật sự kiện Peacock và logo dùng chung 2026.
- Dọn lịch LIVE đã hoàn thành.
- Duy trì dữ liệu health của stream.
- Có cơ chế badge/logo cho Nuvio-Troll.
- Có module TNT riêng.

## Mốc GitHub đã xác minh
- 2026-08-24 — cập nhật Peacock events dùng shared 2026 logo.
- 2026-08-25 — clear lịch LIVE đã hoàn thành và cập nhật LIVE schedule.
- 2026-09-02 — cập nhật LIVE schedule ngày 03/09.
- 2026-09-05 — cập nhật Premier League LIVE ngày 05/09.
- 2026-09-06 — cập nhật Premier League LIVE ngày 06/09.
- 2026-09-07 — cập nhật Premier League LIVE ngày 07/09.

## Cấu trúc chính
- `index.js` — logic chính của addon/API.
- `channels.js` — dữ liệu/cấu hình kênh.
- `bootstrap.js` — khởi tạo/bootstrap.
- `tnt-channels.js` — cấu hình kênh TNT.
- `live.json` — dữ liệu lịch LIVE.
- `stream-health.json` — dữ liệu kiểm tra health stream.
- `nuvio-troll-badges.json` — mapping badge/logo cho Nuvio-Troll.
- `troll-badges/` — tài nguyên badge.
- `scripts/` — script hỗ trợ.
- `.github/` — cấu hình GitHub automation.
- `package.json` — dependency/config Node.js.

## Quy tắc không được phá
- Không tự ý thay đổi kiến trúc đang chạy.
- Không tự ý đổi URL production hoặc cấu hình deploy.
- Không tự động cập nhật `live.json` khi người dùng chưa yêu cầu.
- Khi sửa dữ liệu LIVE phải giữ đúng format mà `index.js` đang đọc.
- Không xóa dữ liệu kênh/logo/badge chỉ vì tưởng là không còn dùng; phải kiểm tra reference trước.

## Công việc định kỳ
- Cập nhật lịch LIVE khi được yêu cầu.
- Xóa/clear sự kiện đã hoàn thành khi phù hợp.
- Kiểm tra stream health khi cần.
- Đồng bộ logo/badge khi có thay đổi nguồn.

## Trạng thái hiện tại
- Repo có dữ liệu LIVE và hệ thống kênh đang tồn tại.
- `live.json` hiện tại có kích thước 3 bytes, cần xem là trạng thái dữ liệu rỗng hiện thời chứ không phải lỗi cho đến khi kiểm tra yêu cầu mới.
- Không được tự khởi động lại việc cập nhật định kỳ nếu người dùng đã tạm dừng.

## Việc tiếp theo
Chờ yêu cầu mới. Khi được yêu cầu tiếp tục, đọc file này + kiểm tra `index.js`, `channels.js`, `live.json`, `.github/` và trạng thái deployment trước khi sửa.

## Cập nhật gần nhất
2026-09-08 — tạo tài liệu `TIEP_TUC_DU_AN.md` để lưu trạng thái và lịch sử làm việc.
