# Book Store Management

This project is a full-stack Book Store Management system designed to help manage book inventory, imports, orders, and related business operations. It includes both backend and frontend components, built with modern web technologies.

# Features

### Admin
- Manage books, categories, publishers, suppliers, and stock levels.
- Configure user roles and permissions.
- View and export import and sales reports (PDF/Excel).
- Manage promotions, discounts, and supplier information.
- Review damage reports and process returns.

### Staff

#### Warehouse Staff
- Record and track book imports and damage reports.
- Adjust inventory levels and manage stock accuracy.

#### Order Management Staff
- Monitor and update order statuses.
- Coordinate shipments and manage shipping methods.

#### Delivery Staff
- Manage delivery processes and update shipment statuses.
- Handle delivery confirmations

### Customer
- Browse and search books by category, publisher, and promotions.
- Place orders, view order history, and track shipments.
- View invoices and payment status.
- Rate and review purchased books.

## Technologies Used

- **Frontend**: React, Vite, Chart.js, jsPDF, html2canvas, XLSX
- **Backend**: Node.js, Express.js, Jest
- **Database**: (Configure in `backend/db.js`)
- **Testing**: Jest


## How to Run

### Backend
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure your database in `db.js`.
3. Start the server:
   ```bash
   npm start
   ```

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Testing
- Run backend tests:
  ```bash
  cd backend
  npm test
  ```

## Exporting Reports
- Import statistics can be exported as PDF or Excel from the frontend charts

## Product Interface
Below are interface screenshots from the application (in the `images/` folder):

- **Home Page**  
  ![Home Page](images/HomePage.png)
- **Home Page (v2)**  
  ![Home Page (v2)](images/HomePage_2.png)
- **Home Page (v3)**  
  ![Home Page (v3)](images/HomePage_3.png)
- **Login Page**  
  ![Login Page](images/Login.png)
- **Forgot Password Step 1**  
  ![Forgot Password Step 1](images/ForgotPassword_1.png)
- **Forgot Password Step 2**  
  ![Forgot Password Step 2](images/ForgotPassword_2.png)
- **Create New Password**  
  ![Create New Password](images/CreateNewPassword.png)
- **Account Management**  
  ![Account Management](images/AccountManagement.png)
- **Create Account for Employee**  
  ![Create Account for Employee](images/CreateAccountForEmployee.png)
- **Book Page**  
  ![Book Page](images/BookPage.png)
**Book Management**  
  ![Book Management](images/BookManagement.png)
**Book Details**  
  ![Book Details](images/BookDetails.png)
**Add Book**  
  ![Add Book](images/AddBook.png)
**Edit Book**  
  ![Edit Book](images/EditBook.png)
**Supplier Management**  
  ![Supplier Management](images/SupplierManagement.png)
**Create New Supplier**  
  ![Create New Supplier](images/CreateNewSupplier.png)
**Edit Supplier**  
  ![Edit Supplier](images/EditSupplier.png)
**Change Rules**  
  ![Change Rules](images/ChangeRules.png)
**Promotion Management**  
  ![Promotion Management](images/PromotionManagement.png)
**Create Promotion**  
  ![Create Promotion](images/CreatePromotion.png)
**Edit Promotion**  
  ![Edit Promotion](images/EditPromotion.png)
**Import Management**  
  ![Import Management](images/ImportManagement.png)
**Create New Import**  
  ![Create New Import](<images/CreateNewImport (2).png>)
**Import Details**  
  ![Import Details](images/ImportDetails.png)
**Import Chart**  
  ![Import Chart](images/ImportChart.png)
**Import Chart (v2)**  
  ![Import Chart (v2)](images/ImportChart_2.png)
**Damaged Book**  
  ![Damaged Book](images/DamagedBook.png)
**Create Damaged Books**  
  ![Create Damaged Books](images/CreateDamagedBooks.png)
**Damaged Book Details**  
  ![Damaged Book Details](images/DamagedBookDetails.png)
**Inventory Chart**  
  ![Inventory Chart](images/InventoryChart.png)
**Inventory Chart (v2)**  
  ![Inventory Chart (v2)](images/InventoryChart_2.png)
**Assign Shipper**  
  ![Assign Shipper](images/AssignShipper.png)
**Delivering Orders**  
  ![Delivering Orders](images/DeliveringOrders.png)
**Delivering Order Details**  
  ![Delivering Order Details](images/DeliveringOrderDetails.png)
**Delivered Orders**  
  ![Delivered Orders](images/DeliveredOrders.png)
**View Processing Orders**  
  ![View Processing Orders](images/ViewProcessingOrders.png)
**View Delivering Orders**  
  ![View Delivering Orders](images/ViewDeliveringOrders.png)
**View Delivered Orders**  
  ![View Delivered Orders](images/ViewDeliveredOrders.png)
**Cart**  
  ![Cart](images/Cart.png)
**Checkout Step 1**  
  ![Checkout Step 1](images/Checkout_1.png)
**Checkout Step 2**  
  ![Checkout Step 2](images/Checkout_2.png)
**Checkout Step 3**  
  ![Checkout Step 3](images/Checkout_3.png)
**My Orders**  
  ![My Orders](images/MyOrders.png)
**Order Details**  
  ![Order Details](images/OrderDetails.png)
**Change Password**  
  ![Change Password](images/ChangePassword.png)
**Top 10 Most Sold Books**  
  ![Top 10 Most Sold Books](images/Top10MostSoldBooks.png)
**Revenue & Books Sold By Day**  
  ![Revenue & Books Sold By Day](<images/Revenue&BooksSoldByDay.png>)
**Revenue & Books Sold By Year**  
  ![Revenue & Books Sold By Year](<images/Revenue&BooksSoldByYear.png>)
**Profile**  
  ![Profile](images/Profile.png)
**Profile (v2)**  
  ![Profile (v2)](images/Profile_2.png)

## License
This project is for educational and demonstration purposes.
