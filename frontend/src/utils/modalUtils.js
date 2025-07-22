/**
 * Các hàm tiện ích để quản lý hiển thị modal
 */

// Thêm class modal-open vào body khi modal được mở
export const openModal = () => {
  document.body.classList.add('modal-open');
};

// Xóa class modal-open khỏi body khi modal được đóng
export const closeModal = () => {
  document.body.classList.remove('modal-open');
};

// Xử lý vấn đề dropdown đè lên modal
export const preventDropdownOverlap = () => {
  // Thêm event listener để ngăn dropdown bên ngoài modal đè lên modal
  document.addEventListener('mousedown', (e) => {
    if (document.body.classList.contains('modal-open')) {
      const modalElements = document.querySelectorAll('.modal-content');
      let isClickInsideModal = false;

      modalElements.forEach(modal => {
        if (modal.contains(e.target)) {
          isClickInsideModal = true;
        }
      });

      if (!isClickInsideModal) {
        // Nếu click bên ngoài modal, ngăn chặn sự kiện mặc định
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, true);
};