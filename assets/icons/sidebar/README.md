# Sidebar Icons

Ảnh icon thay thế cho menu bên trái (sidebar), được quản lý qua **CMS → Sidebar Icons**.

## Quy ước đặt tên

Mỗi file phải đặt tên đúng theo `key` của mục menu, ví dụ:

```
overview.png
oncallcx.svg
group-contact-center.png
```

Khi bạn tải ảnh lên trong CMS, hệ thống sẽ tự đề xuất đúng tên file này —
chỉ cần bấm **"Tải file ảnh"** để lấy file đã đổi tên đúng chuẩn, rồi copy
vào thư mục này (`assets/icons/sidebar/`) trước khi export JSON và commit/push.

## Định dạng hỗ trợ

- PNG / JPG
- SVG (khuyến khích — sắc nét ở mọi kích thước)

Kích thước hiển thị thực tế trên sidebar là 18×18px, nên ảnh vuông,
nền trong suốt (PNG/SVG) sẽ cho kết quả đẹp nhất.
