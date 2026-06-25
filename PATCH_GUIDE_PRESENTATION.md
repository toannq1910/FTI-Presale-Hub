# Hướng dẫn thay file Presentation sau này

Baseline: v8.3.x

## 1. Các file liên quan

```text
assets/presentation/oncallcx.pdf
assets/presentation/oncallcx-pages/page-01.jpg
assets/presentation/oncallcx-pages/page-02.jpg
...
js/presentation-data.js
```

## 2. Khi muốn thay file PDF khác

### Bước 1 — Đổi PDF
Copy file PDF mới vào:

```text
assets/presentation/oncallcx.pdf
```

Giữ đúng tên `oncallcx.pdf` để không phải sửa code.

### Bước 2 — Xuất từng trang PDF thành ảnh
Bạn cần export mỗi trang PDF thành ảnh JPG theo format:

```text
assets/presentation/oncallcx-pages/page-01.jpg
assets/presentation/oncallcx-pages/page-02.jpg
assets/presentation/oncallcx-pages/page-03.jpg
...
```

Tên file phải có 2 chữ số: `01`, `02`, `03`.

### Bước 3 — Cập nhật số trang trong `js/presentation-data.js`
Mở file:

```text
js/presentation-data.js
```

Sửa danh sách `pages`.

Ví dụ PDF mới có 12 trang thì để:

```js
pages: [
  { title: "Slide 1", image: "assets/presentation/oncallcx-pages/page-01.jpg" },
  { title: "Slide 2", image: "assets/presentation/oncallcx-pages/page-02.jpg" },
  ...
  { title: "Slide 12", image: "assets/presentation/oncallcx-pages/page-12.jpg" }
]
```

### Bước 4 — Ctrl + F5
Mở lại web và bấm Ctrl + F5 để trình duyệt load file mới.

## 3. Quy tắc update từ ChatGPT sau này

Từ phiên bản này, nếu bạn yêu cầu thay đổi chức năng, chỉ cần xuất ZIP patch gồm các file thay đổi, ví dụ:

```text
js/main.js
js/presentation-data.js
css/styles.css
```

Không cần xuất nguyên source.

Nếu thay PDF thì ZIP patch có thể chỉ gồm:

```text
assets/presentation/oncallcx.pdf
assets/presentation/oncallcx-pages/
js/presentation-data.js
```

## 4. Cách áp dụng patch ZIP

1. Giải nén file patch ZIP.
2. Copy các thư mục/file trong patch.
3. Dán đè vào project gốc.
4. Chọn Replace khi Windows hỏi.
5. Chạy lại Live Server.
6. Ctrl + F5.
