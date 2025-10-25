# API URL Migration Summary

## Objective
Migrate all hardcoded `http://localhost:5000` URLs to use environment variables (`import.meta.env.VITE_API_BASE_URL`) for dynamic configuration across different environments (local, production, etc.)

## Files Modified (Total: 26 files)

### Configuration Files
1. **`frontend/src/config.js`**
   - Changed: `export const API_BASE_URL = 'http://localhost:5000/api'`
   - To: `export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'`

### Utility Files
2. **`frontend/src/utils/authInterceptor.js`**
   - Added: `const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'`
   - Updated: `fetchData()` function to use `${API_BASE}/${endpoint}`

3. **`frontend/src/utils/axiosInstance.js`**
   - Added: `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'`
   - Updated: `baseURL` to use dynamic variable

### Service Files (frontend/src/services/) - 7 files
4. **AddressService.js**
   - Updated API_BASE_URL to use `import.meta.env.VITE_API_BASE_URL`

5. **AuthService.js**
   - Updated axios baseURL to use `import.meta.env.VITE_API_BASE_URL`

6. **BookService.js**
   - Updated API_URL constant
   - Updated `getTop10MostSoldBooksAll()` function
   - Fixed image URL path construction

7. **CartService.js**
   - Updated API_URL and axios baseURL

8. **ImportService.js**
   - Updated API_URL to dynamic environment variable

9. **PaymentService.js**
   - Updated both Momo and ZaloPay payment endpoints

10. **PromotionService.js**
    - Updated API_URL to dynamic environment variable

11. **ShippingMethodService.js**
    - Updated API_URL to dynamic environment variable

### Component Files - 3 files

12. **`frontend/src/components/rules/RulesSettings.jsx`**
    - Updated `fetchRules()` useEffect
    - Updated `handleSave()` function
    - Both now use dynamic API_BASE

13. **`frontend/src/components/tables/BookTable.jsx`**
    - Updated `fetchBooks()` function
    - Updated category/publisher fetch
    - Updated book edit, delete, submit operations
    - Updated detail view fetch

14. **`frontend/src/components/tables/AccountTable.jsx`**
    - Updated `handleConfirmAction()` for delete/status toggle
    - Updated account save/create operations

### Page Files - 7 files

15. **`frontend/src/pages/profile/PasswordChange.jsx`**
    - Updated password change API call

16. **`frontend/src/pages/profile/ProfilePage.jsx`**
    - Updated user profile fetch
    - Updated profile update API call

17. **`frontend/src/pages/home/HomePage.jsx`**
    - Updated BACKEND_URL constant to use `import.meta.env.VITE_API_BASE_URL`

18. **`frontend/src/pages/checkout/CheckoutPage.jsx`**
    - Updated `getBookImageUrl()` function

19. **`frontend/src/pages/book-detail/BookDetailPage.jsx`**
    - Updated `getBookImageUrl()` function
    - Updated `getImageList()` function

20. **`frontend/src/pages/cart/CartPage.jsx`**
    - Updated `getBookImageUrl()` function with multiple fallbacks

21. **`frontend/src/pages/books/BooksPage.jsx`**
    - Updated `getBookImageUrl()` function

### Modal Files - 1 file

22. **`frontend/src/components/modals/BookDetailsModal.jsx`**
    - Updated image URL construction for multiple image sources

### Form Files - 4 files

23. **`frontend/src/components/forms/BookForm.jsx`**
    - Updated image preview URL construction
    - Updated categories fetch
    - Updated publishers fetch

24. **`frontend/src/components/forms/ImportForm.jsx`**
    - Updated suppliers fetch
    - Updated books fetch
    - Updated rules fetch

25. **`frontend/src/components/forms/PromotionForm.jsx`**
    - Updated rules fetch
    - Updated available-books fetch
    - Updated promotion create/update API calls

### Table Files - 3 files

26. **`frontend/src/components/tables/ImportTable.jsx`**
    - Updated imports fetch
    - Updated suppliers fetch
    - Updated import delete/create operations

27. **`frontend/src/components/tables/DamageReportTable.jsx`**
    - Updated damage reports fetch

28. **`frontend/src/components/tables/PromotionTable.jsx`**
    - Updated promotions fetch
    - Updated promotion delete operation

29. **`frontend/src/components/tables/SupplierTable.jsx`**
    - Updated suppliers fetch

## Environment Variables Configuration

### Development (.env)
```properties
VITE_API_BASE_URL=http://localhost:5000/api
```

### Production (.env.production)
```bash
VITE_API_BASE_URL=https://my-bookstore-backend.azurewebsites.net/api
```

## Pattern Used

### For API endpoints:
```javascript
// ❌ Before (hardcoded)
fetch("http://localhost:5000/api/users")

// ✅ After (dynamic)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
fetch(`${API_BASE}/users`)
```

### For image/file URLs:
```javascript
// ❌ Before (hardcoded)
const imagePath = `http://localhost:5000${book.image_path}`;

// ✅ After (dynamic)
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5000";
const imagePath = `${BACKEND_URL}${book.image_path}`;
```

## Benefits
- ✅ Environment-agnostic code
- ✅ Easy deployment to production without code changes
- ✅ Support for multiple deployment environments
- ✅ Fallback to localhost for local development
- ✅ Consistent API endpoint configuration
- ✅ Single source of truth for API base URLs

## Testing Recommendations
1. Test locally with existing `http://localhost:5000/api` setup
2. Update `.env.production` with actual production API URL
3. Build and test production deployment
4. Verify all API calls use correct environment URL
5. Test image loading with production URLs
6. Verify CORS settings work across all environments

## Notes
- All fallback values maintain backward compatibility with localhost
- Image URL construction strips `/api` from base URL where needed
- Axios interceptors automatically apply to all configured instances
- No changes required to backend code
- All localhost references are now through `import.meta.env.VITE_API_BASE_URL`
