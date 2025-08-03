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

#### Sales Staff
- Process customer orders and handle payments.
- Create, send, and manage invoices.

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

## License
This project is for educational and demonstration purposes.
