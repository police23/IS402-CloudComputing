
const PDFDocument = require("pdfkit");
const path = require("path");
const { Invoice, InvoiceDetail, Book, User, Promotion } = require('../models');

// Lấy danh sách hóa đơn
const getAllInvoices = async () => {
  return await Invoice.findAll({
    include: [
      { model: User, as: 'creator', attributes: ['full_name'] },
      { model: Promotion, as: 'promotion', attributes: ['name'] },
      { 
        model: InvoiceDetail, 
        as: 'details', 
        include: [{ model: Book, as: 'book', attributes: ['title'] }] 
      }
    ],
    order: [['created_at', 'DESC']]
  });
};

const getInvoicesByUser = async (userId) => {
  if (!userId) throw new Error("Thiếu tham số userId");
  return await Invoice.findAll({
    where: { created_by: userId },
    include: [
      { model: User, as: 'creator', attributes: ['full_name'] },
      { model: Promotion, as: 'promotion', attributes: ['name'] },
      { 
        model: InvoiceDetail, 
        as: 'details', 
        include: [{ model: Book, as: 'book', attributes: ['title'] }] 
      }
    ],
    order: [['created_at', 'DESC']]
  });
};

// Thêm hóa đơn mới
const addInvoice = async (invoiceData) => {
  const { customer_name, customer_phone, total_amount, discount_amount, final_amount, promotion_code, created_by, created_at, bookDetails } = invoiceData;
  // Kiểm tra tồn kho
  for (const detail of bookDetails) {
    const book = await Book.findByPk(detail.book_id);
    const currentStock = book?.quantity_in_stock ?? 0;
    if (detail.quantity > currentStock) {
      throw {
        status: 400,
        message: `Sách ID ${detail.book_id} không đủ tồn kho. Hiện còn: ${currentStock}, yêu cầu: ${detail.quantity}`
      };
    }
  }
  // Tạo hóa đơn
  const invoice = await Invoice.create({
    customer_name,
    customer_phone,
    total_amount,
    discount_amount,
    final_amount,
    promotion_code: promotion_code || null,
    created_by,
    created_at: created_at || new Date()
  });
  // Tạo chi tiết hóa đơn
  for (const detail of bookDetails) {
    await InvoiceDetail.create({
      invoice_id: invoice.id,
      book_id: detail.book_id,
      quantity: detail.quantity,
      unit_price: detail.unit_price
    });
    // Trừ tồn kho
    const book = await Book.findByPk(detail.book_id);
    book.quantity_in_stock -= detail.quantity;
    await book.save();
  }
  return invoice;
};

// Lấy chi tiết hóa đơn theo id
const getInvoiceById = async (invoiceId) => {
  const invoice = await Invoice.findByPk(invoiceId, {
    include: [
      { model: User, as: 'creator', attributes: ['full_name'] },
      { model: Promotion, as: 'promotion', attributes: ['name'] },
      { 
        model: InvoiceDetail, 
        as: 'details', 
        include: [{ model: Book, as: 'book', attributes: ['title'] }] 
      }
    ]
  });
  if (!invoice) return null;
  return invoice;
};

// Xóa hóa đơn
const deleteInvoice = async (invoiceId) => {
  await InvoiceDetail.destroy({ where: { invoice_id: invoiceId } });
  const result = await Invoice.destroy({ where: { id: invoiceId } });
  return result;
};

// Lấy tổng doanh thu theo tháng trong năm
const getYearlyRevenueData = async (year) => {
    if (!year) {
        throw new Error("Thiếu tham số năm");
    }

    // Lấy dữ liệu cho cả 12 tháng
    const monthly = [];
    for (let m = 1; m <= 12; m++) {
        const result = await invoiceModel.getTotalRevenueByMonth(m, year);
        monthly.push({
            month: m,
            totalRevenue: result.totalRevenue || 0,
            totalSold: result.totalSold || 0
        });
    }
    return { monthly };
};

// Lấy doanh thu theo ngày trong một tháng cụ thể

// Tạo file PDF hóa đơn
const generateInvoicePDF = async (invoiceId, res) => {
    const invoice = await invoiceModel.getInvoiceById(invoiceId);
    if (!invoice) {
        throw new Error("Không tìm thấy hóa đơn");
    }    
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    try {
        doc.registerFont(
            "DejaVu",
            path.join(__dirname, "../../public/fonts/DejaVuSans.ttf")
        );
        doc.font("DejaVu");
    } catch (fontErr) {
        throw new Error("Không tìm thấy hoặc lỗi font DejaVuSans.ttf");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${invoice.id || "unknown"}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text(`HÓA ĐƠN BÁN SÁCH`, { align: "center" });
    doc.moveDown(1.5);

    const leftColumn = 50;
    const rightColumn = 300;
    const startY = doc.y;

    doc.fontSize(12).text(`Khách hàng: ${invoice.customer_name || ""}`, leftColumn, startY);
    doc.text(`SĐT: ${invoice.customer_phone || ""}`, leftColumn);

    doc.fontSize(12).text(`Ngày: ${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString("vi-VN") : ""}`, rightColumn, startY);
    doc.text(`Người lập: ${invoice.created_by_name}`, rightColumn);

    doc.moveDown(2);

    doc.text("Chi tiết đơn hàng:", 50, doc.y, { underline: true, align: "left" });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidths = [40, 200, 40, 80, 100]; // Chiều rộng các cột
    const colPositions = [
        tableLeft, 
        tableLeft + colWidths[0], 
        tableLeft + colWidths[0] + colWidths[1], 
        tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
        tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]
    ];
    const rowHeight = 25;
    
    // Vẽ header của bảng
    doc.font("DejaVu").fontSize(12);
    doc.rect(tableLeft, tableTop, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
    doc.text("STT", colPositions[0] + 5, tableTop + 7, { width: colWidths[0] - 10 });
    doc.text("Tên sách", colPositions[1] + 5, tableTop + 7, { width: colWidths[1] - 10 });
    doc.text("SL", colPositions[2] + 5, tableTop + 7, { width: colWidths[2] - 10, align: 'center' });
    doc.text("Đơn giá", colPositions[3] + 5, tableTop + 7, { width: colWidths[3] - 10, align: 'right' });
    doc.text("Thành tiền", colPositions[4] + 5, tableTop + 7, { width: colWidths[4] - 10, align: 'right' });
    
    // Vẽ đường kẻ ngăn cách header và nội dung
    doc.moveTo(tableLeft, tableTop + rowHeight)
       .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), tableTop + rowHeight)
       .stroke();
       
    // Vẽ các đường kẻ dọc ngăn cách các cột
    for (let i = 1; i < colPositions.length; i++) {
        doc.moveTo(colPositions[i], tableTop)
           .lineTo(colPositions[i], tableTop + rowHeight)
           .stroke();
    }
    
    // Ensure bookDetails is an array
    const bookDetails = Array.isArray(invoice.bookDetails) ? invoice.bookDetails : [];
    let currentTop = tableTop + rowHeight;
    
    // Vẽ các dòng cho từng sản phẩm
    bookDetails.forEach((book, idx) => {
        // Vẽ khung cho dòng
        doc.rect(tableLeft, currentTop, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
        
        // Điền nội dung vào từng ô
        doc.text(`${idx + 1}`, colPositions[0] + 5, currentTop + 7, { width: colWidths[0] - 10 });
        doc.text(`${book.book_title || book.title || ""}`, colPositions[1] + 5, currentTop + 7, { width: colWidths[1] - 10 });
        doc.text(`${book.quantity || 0}`, colPositions[2] + 5, currentTop + 7, { width: colWidths[2] - 10, align: 'center' });
        doc.text(`${Number(book.unit_price || 0).toLocaleString("vi-VN")}`, colPositions[3] + 5, currentTop + 7, { width: colWidths[3] - 10, align: 'right' });
        doc.text(`${((book.quantity || 0) * (book.unit_price || 0)).toLocaleString("vi-VN")}`, colPositions[4] + 5, currentTop + 7, { width: colWidths[4] - 10, align: 'right' });
        
        // Vẽ đường kẻ dọc ngăn cách các cột
        for (let i = 1; i < colPositions.length; i++) {
            doc.moveTo(colPositions[i], currentTop)
               .lineTo(colPositions[i], currentTop + rowHeight)
               .stroke();
        }
        
        currentTop += rowHeight;
    });

    doc.moveDown();
    currentTop += 15;
    const labelX = 320;
    const valueX = 470;
    const lineHeight = 22;
    doc.fontSize(12);

    doc.text("Tổng tiền hàng:", labelX, currentTop);
    doc.text(`${Number(invoice.total_amount || 0).toLocaleString("vi-VN")} VNĐ`, valueX, currentTop, { align: 'left' });

    currentTop += lineHeight;
    doc.text("Giảm giá:", labelX, currentTop);
    doc.text(`${Number(invoice.discount_amount || 0).toLocaleString("vi-VN")} VNĐ`, valueX, currentTop, { align: 'left' });

    currentTop += lineHeight;
    doc.text("Thành tiền:", labelX, currentTop);
    doc.fontSize(12); 
    doc.text(`${Number(invoice.final_amount || 0).toLocaleString("vi-VN")} VNĐ`, valueX, currentTop, { align: 'left' });

    doc.end();
    return doc;
};

module.exports = {
    getAllInvoices,
    getInvoicesByUser,
    addInvoice,
    getInvoiceById,
    deleteInvoice,
    generateInvoicePDF,
};
