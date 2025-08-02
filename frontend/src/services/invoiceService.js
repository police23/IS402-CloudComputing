import axios from "axios";

const API_URL = "http://localhost:5000/api/invoices";


// Helper to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllInvoices = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeader() });
  return response.data;
};

export const addInvoice = async (invoiceData) => {
  console.log("addInvoice được gọi với dữ liệu:", invoiceData);
  try {
    const response = await axios.post(API_URL, invoiceData, { headers: getAuthHeader() });
    console.log("addInvoice nhận được response:", response);
    
    // Kiểm tra xem response có dữ liệu và ID không
    if (response.data && response.data.id) {
      console.log("Response có ID hóa đơn:", response.data.id);
      return response.data;
    } else {
      console.warn("Response không có ID hóa đơn:", response.data);
      
      // Thử lấy danh sách hóa đơn mới nhất để tìm ID
      try {
        const allInvoices = await getAllInvoices();
        // Tìm hóa đơn mới nhất dựa vào thông tin khách hàng
        const latestInvoice = allInvoices
          .filter(inv => 
            inv.customer_name === invoiceData.customer_name && 
            inv.customer_phone === invoiceData.customer_phone)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          
        if (latestInvoice && latestInvoice.id) {
          console.log("Đã tìm thấy ID hóa đơn thông qua danh sách:", latestInvoice.id);
          return latestInvoice;
        }
      } catch (err) {
        console.error("Không thể tìm ID hóa đơn từ danh sách:", err);
      }
      
      // Nếu không tìm được, trả về response ban đầu
      return response.data;
    }
  } catch (error) {
    console.error("addInvoice gặp lỗi:", error.response || error);
    throw error;
  }
};

export const getInvoiceById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
  return response.data;
};

export const deleteInvoice = async (id) => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

export const exportInvoicePDF = async (id) => {
  console.log("Đang gọi API xuất PDF cho hóa đơn ID:", id);
  try {
    if (!id) {
      console.error("ID hóa đơn không hợp lệ:", id);
      alert("Không thể xuất PDF: ID hóa đơn không hợp lệ");
      return false;
    }
    
    // Log URL gọi API để kiểm tra
    const url = `${API_URL}/${id}/pdf`;
    console.log("URL gọi API PDF:", url);
    
    // Gọi API với responseType là 'blob' để nhận dữ liệu dưới dạng binary
    console.log("Đang gửi request lấy PDF...");
    const response = await axios.get(url, {
      headers: getAuthHeader(),
      responseType: 'blob'
    });
    
    console.log("Đã nhận response từ API PDF:", response.status, response.headers);
    
    // Kiểm tra response có dữ liệu và đúng content-type không
    if (!response.data || response.data.size === 0) {
      console.error("Response không có dữ liệu hoặc dữ liệu rỗng");
      alert("Không thể xuất PDF: Server không trả về dữ liệu");
      return false;
    }
    
    // Tạo URL object từ blob response
    const contentType = response.headers['content-type'] || 'application/pdf';
    console.log("Content-Type của file:", contentType);
    
    const blob = new Blob([response.data], { type: contentType });
    console.log("Đã tạo blob với kích thước:", blob.size, "bytes");
    
    const blobUrl = window.URL.createObjectURL(blob);
    console.log("Đã tạo blobUrl:", blobUrl);
    
    // Tạo một element a tạm thời để kích hoạt tải xuống
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `invoice-${id}.pdf`;
    
    console.log("Đang kích hoạt tải xuống file...");
    // Thêm link vào DOM, click để tải và sau đó xóa đi
    document.body.appendChild(link);
    link.click();
    
    // Thêm delay trước khi xóa link để đảm bảo browser có đủ thời gian xử lý
    setTimeout(() => {
      document.body.removeChild(link);
      console.log("Đã xóa link tạm thời");
      
      // Giải phóng URL object để tránh rò rỉ bộ nhớ
      window.URL.revokeObjectURL(blobUrl);
      console.log("Đã giải phóng blobUrl");
    }, 500);
    
    return true;
  } catch (error) {
    console.error('Lỗi chi tiết khi tải file PDF:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
    alert('Không thể tải file PDF. Vui lòng thử lại sau.');
    return false;
  }
};