# FTI Collaboration Customer Hub

Thiết kế lại frontend theo phong cách FTI Presales Hub từ `Source-genspark-Phuongdd6.txt`.

## Chạy local
Mở `index.html` bằng VS Code Live Server.

## Login / Permission
Login đã viết sẵn nhưng mặc định đang tắt.

Mở `js/config.js`:

```js
LOGIN_REQUIRED: false
```

Đổi thành `true` để bật login.

Bật/tắt chức năng:

```js
PERMISSIONS: {
  viewDemo: true,
  exportProposal: false
}
```

## Nội dung chính
- Sidebar nhiều zone giống mẫu
- Màu cam chủ đạo + dark enterprise
- Logo FPT
- Trang tổng quan cho khách hàng
- Danh mục giải pháp Contact Center / Video / Integration
- Khu vực Demo sản phẩm
- Bảng so sánh
- Compliance Việt Nam


## Fix v2 — No Login by default
- Login form vẫn có sẵn trong code.
- Mặc định mở link vào thẳng trang chính.
- Khi cần bật login sau này, đổi `LOGIN_REQUIRED:false` thành `LOGIN_REQUIRED:true` trong `js/config.js`.


## v3 — Updated data from uploaded screenshots
Đã đưa dữ liệu từ các hình vào code:
- CCaaS Việt Nam
- CCaaS Global
- UC/PBX Việt Nam
- CRM/ERP Việt Nam
- Bảng so sánh API
- Quy định & tuân thủ tại Việt Nam

Dữ liệu nằm trong:
```text
js/data.js
```


## v5 — Full CRUD cho bài viết bên trong nhóm
Đã bổ sung:
- Nút `Chỉnh sửa` trực tiếp trên từng card bên trong CCaaS Việt Nam / Global / UC-PBX / CRM.
- Nút `Xóa` trực tiếp trên từng card.
- Nút `+ Thêm bài viết` tại đầu mỗi nhóm.
- Trang `Quản lý bài viết nhóm` để thêm/sửa/xóa theo từng nhóm.
- Dữ liệu lưu bằng LocalStorage để demo frontend.

Các trang:
```text
#index.html#vendor-editor
#index.html#ccaas-vn
#index.html#ccaas-global
#index.html#ucpbx-vn
#index.html#crm
```


## v6 — CRUD toàn bộ các trang chính
Đã kiểm tra và bổ sung:
- OnCallCX / Video / API Reference / Integration: thêm, sửa, xóa card bài viết.
- CCaaS Việt Nam / CCaaS Global / UC-PBX Việt Nam / CRM-ERP: thêm, sửa, xóa card bên trong nhóm.
- Tuân thủ VN: thêm, sửa, xóa bài viết tuân thủ.
- Dữ liệu vẫn lưu LocalStorage để demo frontend không cần backend.

Lưu ý:
- Sau khi cập nhật, nên Ctrl + F5.
- Nếu trình duyệt đang giữ LocalStorage cũ, có thể clear site data để test lại từ đầu.


## v6.1 — Fix click CRUD/link
Đã sửa lỗi:
- Click `Chỉnh sửa` trong CRM/ERP Việt Nam, UC/PBX Việt Nam, CCaaS Việt Nam không hoạt động.
- Hash route dạng `#vendor-editor:group:id` không render đúng khi mở trực tiếp.
- Sau khi xóa bài viết trong nhóm, tự quay về đúng page group thay vì lỗi route.
- Thêm xử lý Back/Forward hashchange.


## v6.2 — Fix mất dữ liệu khi bấm Chỉnh sửa
Đã sửa lỗi route của vendor editor.

Nguyên nhân:
- Nút `Chỉnh sửa` truyền hash dạng `vendor-editor:crm|base-crm-0`.
- Parser editor lại tách bằng dấu `:`, nên hiểu sai `groupKey = crm|base-crm-0`, không tìm được bài viết gốc và tự hiển thị form “Bài viết mới”.

Cách sửa:
- Dùng format hash an toàn: `vendor-editor:<group>~<vendorId>`.
- Bổ sung `packVendorHash()` / `unpackVendorHash()`.
- Khi mở edit từ CRM/ERP, UC/PBX, CCaaS Việt Nam sẽ load đúng dữ liệu hiện có.


## v7 Product pages + API Reference folders
- API endpoint format moved to API Reference folders.
- Product/partner pages now render Wordpress-style article cards.
- Folders: CONTACT CENTER/API Reference/CCaaS/Đối Tác Việt Nam, CCaaS/Đối tác quốc tế, UCaaS/Đối Tác Việt Nam, UCaaS/Đối tác quốc tế.


## v8 — Corrected requirement
Đã sửa theo đúng ý:
1. Bài viết cũ đang hiển thị dạng API trong OnCallCX / CCaaS VN / CCaaS Global / UC/PBX VN được chuyển nguyên sang API Reference, không chỉ chuyển endpoint.
2. API Reference chia theo 4 thư mục:
   - CONTACT CENTER/API Reference/CCaaS/Đối Tác Việt Nam
   - CONTACT CENTER/API Reference/CCaaS/Đối tác quốc tế
   - CONTACT CENTER/API Reference/UCaaS/Đối Tác Việt Nam
   - CONTACT CENTER/API Reference/UCaaS/Đối tác quốc tế
3. Các mục đã di chuyển được thay bằng bài viết sản phẩm kiểu Wordpress/Product Article.
4. Nội dung sản phẩm được tổng hợp từ trang chủ/nguồn chính thức của đối tác và lưu tại:
   - data/partner-product-catalog.json
   - js/data.js export partnerProductCatalog
5. CRUD LocalStorage vẫn hoạt động cho bài viết sản phẩm.


## v8.1 — UI Fix theo feedback
- CCaaS Việt Nam / CCaaS Global / UC-PBX / OnCallCX hiển thị dạng thẻ card giống CRM/ERP.
- Mỗi thẻ có nút `Xem chi tiết` mở trang chủ/website của đối tác.
- API Reference: thư mục API được chuyển lên ngay dưới phần mô tả `CONTACT CENTER / API Reference`.
- Breadcrumb rút gọn: chỉ còn `CCaaS/Đối Tác Việt Nam`, `CCaaS/Đối tác quốc tế`, `UCaaS/Đối Tác Việt Nam`, `UCaaS/Đối tác quốc tế`.


## v8.2 — OnCallCX only
- Mục OnCallCX chỉ giữ lại 01 bài viết.
- Đổi tiêu đề `OnCallCX — Contact Center made by FPT` thành `OncallCX - Contact Center As A Service`.
- Các bài viết đối tác khác vẫn nằm tại mục `CCaaS Việt Nam`.


## v8.3 — OnCallCX Presentation PDF
- Chỉ thay đổi trong sidebar/page `OnCallCX`.
- Nút của bài `OncallCX - Contact Center As A Service` đổi từ `Xem chi tiết` sang `Xem Presentation`.
- Không dẫn sang `oncallcx.vn`.
- PDF được lưu tại `assets/presentation/oncallcx.pdf`.
- Thêm route nội bộ `#presentation-oncallcx` để trình chiếu PDF trực tiếp trên portal.


## v8.3.1 — Presentation mục lục + xem từng trang
Baseline: v8.3

Đã cập nhật phần OnCallCX Presentation:
- Chuyển PDF thành ảnh từng trang tại `assets/presentation/oncallcx-pages/`.
- Thêm mục lục bên trái.
- Click mục lục để nhảy tới trang tương ứng.
- Nút Previous / Next để xem từng trang.
- Có Zoom + / Zoom - và Fullscreen.
- Hỗ trợ phím mũi tên trái/phải.
- Không thay đổi các sidebar khác ngoài OnCallCX Presentation.

Số trang render: 49


## v8.3.2 — Presentation thumbnail mục lục + fullscreen arrows
Baseline: v8.3.1

Đã sửa theo feedback:
- Mục lục bên trái đổi từ text list sang thumbnail ảnh từng trang, có scroll giống PowerPoint.
- Click thumbnail để nhảy tới trang tương ứng.
- Previous / Next vẫn chuyển từng trang.
- Khi Fullscreen, có mũi tên Previous / Next ẩn hai bên.
- Mũi tên chỉ hiện khi hover/di chuyển chuột vào vùng trình chiếu.


## v8.3.3 — Presentation config patch
- Tách cấu hình presentation ra `js/presentation-data.js`.
- Sau này đổi PDF/đổi số trang chỉ cần cập nhật `assets/presentation/` và `js/presentation-data.js`.
- Từ sau bản này, các bản update sẽ xuất dạng PATCH ZIP, chỉ gồm file thay đổi.
