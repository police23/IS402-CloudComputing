# CSS Global cho Buttons trong ứng dụng Quản Lý Nhà Sách

File `global-buttons.css` được tạo để đảm bảo tính nhất quán trong kiểu dáng và màu sắc của các button trên toàn bộ ứng dụng.

## Cách hoạt động

- File này được import trong `main.jsx` nên sẽ có hiệu lực trên toàn bộ ứng dụng
- CSS trong file này sử dụng `!important` để đảm bảo ghi đè lên tất cả các style khác
- Các lớp CSS được thiết kế để tương thích với cấu trúc hiện tại của ứng dụng

## Các class có sẵn

### Button cơ bản

```html
<button className="btn">Button cơ bản</button>
```

### Button với icon

```html
<button className="btn">
  <i className="icon"></i> Button với icon
</button>
```

### Các loại button

1. Button Thêm (màu xanh lá)
```html
<button className="btn btn-add">Thêm mới</button>
```

2. Button Sửa (màu xanh dương)
```html
<button className="btn btn-edit">Chỉnh sửa</button>
```

3. Button Xóa (màu đỏ)
```html
<button className="btn btn-delete">Xóa</button>
```

### Button đã bị vô hiệu hóa

```html
<button className="btn btn-edit" disabled>Chỉnh sửa</button>
```

## Trong trường hợp cần thay đổi style

Nếu cần thay đổi style của các button, chỉ cần chỉnh sửa file `global-buttons.css`. 
Các thay đổi sẽ được áp dụng đồng bộ trên toàn bộ ứng dụng mà không cần sửa từng 
component riêng lẻ.

## Lưu ý

- Không nên override các style này trong các component con để đảm bảo tính nhất quán
- Nếu một số trường hợp đặc biệt cần style riêng, hãy sử dụng class khác thay vì thay đổi
  style của các class này
