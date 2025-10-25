# Environment Configuration Guide

## Quick Start

### Local Development
Sử dụng file `.env` hiện có (không cần thay đổi):

```properties
# .env (Development)
VITE_USE_MOCK_AUTH=false 
VITE_API_BASE_URL=http://localhost:5000/api
```

**Chạy frontend:**
```bash
cd frontend
npm install
npm run dev
```

Backend sẽ chạy trên `http://localhost:5000` và frontend tự động sử dụng API từ file `.env`.

---

## Production Deployment

### 1. Update `.env.production`

```bash
# .env.production
VITE_API_URL=https://my-bookstore-backend.azurewebsites.net/api
```

**Thay thế:**
- `my-bookstore-backend.azurewebsites.net` → URL thực tế của backend production

### 2. Build cho Production

```bash
cd frontend
npm run build
```

Khi build, Vite sẽ tự động:
- Đọc biến từ `.env.production`
- Thay thế `import.meta.env.VITE_API_BASE_URL` bằng giá trị thực tế
- Tối ưu hóa bundle

### 3. Deploy

**Deploy lên Azure, Vercel, hoặc server tùy chọn:**

#### Azure Static Web Apps:
```bash
npm run build
# Copy dist/ folder sang Azure
```

#### Vercel:
```bash
vercel --prod
```

#### Nginx:
```bash
cp -r dist/* /var/www/html/
```

---

## Environment Variables Details

### VITE_API_BASE_URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-api-domain.com/api`
- **Purpose:** Base URL cho tất cả API calls
- **Format:** `https://domain.com/api` (kết thúc bằng `/api`)

### VITE_USE_MOCK_AUTH
- **Value:** `true` hoặc `false`
- **Purpose:** Sử dụng mock authentication cho testing
- **Development:** `false` (dùng API thật)

---

## File Structure

```
frontend/
├── .env                  # Development env (localhost)
├── .env.production       # Production env (thay đổi tùy theo deployment)
├── vite.config.js
├── src/
│   ├── config.js         # API_BASE_URL được định nghĩa ở đây
│   ├── services/         # Các service sử dụng biến env
│   └── pages/           # Các page sử dụng biến env
└── dist/                # Build output (sau khi npm run build)
```

---

## Common Issues & Solutions

### Issue 1: API call vẫn dùng localhost ở production
**Cause:** Chưa build lại sau khi update `.env.production`

**Solution:**
```bash
npm run build --mode production
```

### Issue 2: CORS error khi call API
**Cause:** URL không khớp giữa frontend và backend

**Solution:**
1. Kiểm tra `.env.production` có đúng URL backend không
2. Backend phải enable CORS cho domain frontend:
```javascript
// backend/server.js
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### Issue 3: 404 khi load ảnh từ backend
**Cause:** BACKEND_URL không khớp

**Solution:**
- Đảm bảo `VITE_API_BASE_URL` đúng
- Image URL phải là: `https://api-domain.com/uploads/book-image.jpg`

---

## Verification Checklist

- [ ] Update `.env.production` với API URL thực tế
- [ ] Run `npm run build` to compile
- [ ] Test API calls bằng browser DevTools (Network tab)
- [ ] Verify images load từ đúng domain
- [ ] Check console không có error về API
- [ ] Test tất cả chức năng: login, fetch data, upload
- [ ] Verify fallback URL không bao giờ dùng ở production

---

## Multiple Environment Setup

Nếu cần nhiều environment (staging, demo, etc.):

**Create new env file:**
```bash
# .env.staging
VITE_API_BASE_URL=https://staging-api.example.com/api
```

**Build for staging:**
```bash
npm run build -- --mode staging
```

---

## Environment Variable Access

Sử dụng trong code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
console.log(apiUrl);  
// Development: http://localhost:5000/api
// Production: https://my-api.azurewebsites.net/api
```

**Note:** Chỉ biến bắt đầu với `VITE_` mới có sẵn ở client-side

---

## Reference

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [CORS Setup](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Azure Static Web Apps Deployment](https://docs.microsoft.com/en-us/azure/static-web-apps/)
