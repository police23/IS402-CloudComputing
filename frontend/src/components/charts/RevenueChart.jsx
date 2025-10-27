import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
  BarController,
} from "chart.js";
import * as XLSX from 'xlsx';
import { getBookRevenueDetailsByYear, getBookRevenueDetailsByMonth } from "../../services/ReportService";
import "./RevenueChart.css";

ChartJS.register(LineController, BarController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, BarElement);

const typeLabels = {
  all: "Tất cả",
  offline: "Offline",
  online: "Online"
};

const RevenueTable = ({ data, year, month, viewType = "monthly", type = "all" }) => {
  const [detailData, setDetailData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Hàm lấy dữ liệu chi tiết doanh thu từng sách
  const fetchDetailData = async () => {
    try {
      setIsExporting(true);
      let result;
      if (viewType === 'monthly') {
        console.log(`Đang gọi API getBookRevenueDetailsByYear với year=${year}, type=${type}`);
        try {
          result = await getBookRevenueDetailsByYear(year, type);
          console.log("Kết quả trả về:", result);
        } catch (err) {
          console.error("Chi tiết lỗi khi gọi API:", err);
          if (err.response) {
            console.error("Phản hồi lỗi:", err.response.data);
            console.error("Mã trạng thái:", err.response.status);
          }
          throw err;
        }
      } else {
        console.log(`Đang gọi API getBookRevenueDetailsByMonth với month=${month}, year=${year}, type=${type}`);
        try {
          result = await getBookRevenueDetailsByMonth(month, year, type);
          console.log("Kết quả trả về:", result);
        } catch (err) {
          console.error("Chi tiết lỗi khi gọi API:", err);
          if (err.response) {
            console.error("Phản hồi lỗi:", err.response.data);
            console.error("Mã trạng thái:", err.response.status);
          }
          throw err;
        }
      }
      setDetailData(result);
      return result;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu chi tiết:", error);
      alert("Có lỗi xảy ra khi lấy dữ liệu chi tiết doanh thu");
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  // Hàm xuất Excel
  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Kiểm tra kết nối API trước
      console.log("Đang kiểm tra kết nối API...");
      let testDetails = [];
      
      // Trường hợp không có dữ liệu thực, tạo dữ liệu mẫu để vẫn xuất được Excel
      if (viewType === 'monthly') {
        testDetails = [
          {
            id: 1,
            title: "Sách mẫu 1",
            price: 100000,
            month: 1,
            quantity_sold: 10,
            revenue: 1000000
          },
          {
            id: 2,
            title: "Sách mẫu 2",
            price: 150000,
            month: 2,
            quantity_sold: 5,
            revenue: 750000
          }
        ];
      } else {
        testDetails = [
          {
            id: 1,
            title: "Sách mẫu 1",
            price: 100000,
            day: 1,
            quantity_sold: 2,
            revenue: 200000
          },
          {
            id: 2,
            title: "Sách mẫu 2",
            price: 150000,
            day: 2,
            quantity_sold: 3,
            revenue: 450000
          }
        ];
      }
      
      // Thử lấy dữ liệu thực từ API
      let details;
      try {
        details = detailData || await fetchDetailData();
        console.log("Dữ liệu chi tiết nhận được:", details);
      } catch (error) {
        console.error("Không thể lấy dữ liệu từ API, sử dụng dữ liệu mẫu:", error);
        details = testDetails;
        alert("Không thể kết nối đến máy chủ. Sẽ sử dụng dữ liệu mẫu để xuất báo cáo.");
      }
      
      // Kiểm tra dữ liệu có tồn tại không
      if (!details || details.length === 0) {
        details = testDetails;
        alert("Không có dữ liệu thực để xuất báo cáo. Sẽ sử dụng dữ liệu mẫu.");
      }
      
      // Tạo workbook mới
      const wb = XLSX.utils.book_new();
      
      // Tạo worksheet tổng quan
      let overviewData;
      
      if (viewType === 'monthly') {
        // Tạo worksheet tổng quan theo tháng
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const revenueByMonth = months.map((m) => {
          const found = data.monthly.find((item) => Number(item.month) === m);
          return found
            ? {
                Tháng: `Tháng ${m}`,
                "Doanh thu (VNĐ)": Number(found.totalRevenue) || 0,
                "Số lượng sách bán": Number(found.totalSold) || 0,
              }
            : { Tháng: `Tháng ${m}`, "Doanh thu (VNĐ)": 0, "Số lượng sách bán": 0 };
        });
        
        // Thêm hàng tổng kết
        const totalRevenue = revenueByMonth.reduce((sum, item) => sum + item["Doanh thu (VNĐ)"], 0);
        const totalSold = revenueByMonth.reduce((sum, item) => sum + item["Số lượng sách bán"], 0);
        
        revenueByMonth.push({ 
          Tháng: "TỔNG CỘNG", 
          "Doanh thu (VNĐ)": totalRevenue, 
          "Số lượng sách bán": totalSold 
        });
        
        overviewData = revenueByMonth;
      } else {
        // Tạo worksheet tổng quan theo ngày
        overviewData = data.daily.map(item => ({
          Ngày: `Ngày ${item.day}`,
          "Doanh thu (VNĐ)": Number(item.totalRevenue) || 0,
          "Số lượng sách bán": Number(item.totalSold) || 0
        }));
        
        // Thêm hàng tổng kết
        const totalRevenue = overviewData.reduce((sum, item) => sum + item["Doanh thu (VNĐ)"], 0);
        const totalSold = overviewData.reduce((sum, item) => sum + item["Số lượng sách bán"], 0);
        
        overviewData.push({ 
          Ngày: "TỔNG CỘNG", 
          "Doanh thu (VNĐ)": totalRevenue, 
          "Số lượng sách bán": totalSold 
        });
      }
      
      // Thêm worksheet tổng quan
      const wsOverview = XLSX.utils.json_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng quan");
      
      // Tạo worksheet chi tiết từng sách
      let booksData = [];
      
      if (viewType === 'monthly') {
        // Nhóm sách theo tháng
        const booksByMonth = {};
        details.forEach(item => {
          const month = Number(item.month);
          if (!booksByMonth[month]) {
            booksByMonth[month] = [];
          }
          booksByMonth[month].push({
            "Mã sách": item.id,
            "Tên sách": item.title,
            "Giá bán (VNĐ)": Number(item.price) || 0,
            "Số lượng bán": Number(item.quantity_sold) || 0,
            "Doanh thu (VNĐ)": Number(item.revenue) || 0,
          });
        });
        
        // Tạo worksheet cho mỗi tháng
        for (const month in booksByMonth) {
          const monthData = booksByMonth[month];
          
          // Thêm tổng cộng
          const totalRevenue = monthData.reduce((sum, book) => sum + book["Doanh thu (VNĐ)"], 0);
          const totalSold = monthData.reduce((sum, book) => sum + book["Số lượng bán"], 0);
          
          monthData.push({
            "Mã sách": "",
            "Tên sách": "TỔNG CỘNG",
            "Giá bán (VNĐ)": "",
            "Số lượng bán": totalSold,
            "Doanh thu (VNĐ)": totalRevenue,
          });
          
          const wsMonth = XLSX.utils.json_to_sheet(monthData);
          XLSX.utils.book_append_sheet(wb, wsMonth, `Tháng ${month}`);
        }
      } else {
        // Nhóm sách theo ngày
        const booksByDay = {};
        details.forEach(item => {
          const day = Number(item.day);
          if (!booksByDay[day]) {
            booksByDay[day] = [];
          }
          booksByDay[day].push({
            "Mã sách": item.id,
            "Tên sách": item.title,
            "Giá bán (VNĐ)": Number(item.price) || 0,
            "Số lượng bán": Number(item.quantity_sold) || 0,
            "Doanh thu (VNĐ)": Number(item.revenue) || 0,
          });
        });
        
        // Tạo worksheet cho mỗi ngày
        for (const day in booksByDay) {
          const dayData = booksByDay[day];
          
          // Thêm tổng cộng
          const totalRevenue = dayData.reduce((sum, book) => sum + book["Doanh thu (VNĐ)"], 0);
          const totalSold = dayData.reduce((sum, book) => sum + book["Số lượng bán"], 0);
          
          dayData.push({
            "Mã sách": "",
            "Tên sách": "TỔNG CỘNG",
            "Giá bán (VNĐ)": "",
            "Số lượng bán": totalSold,
            "Doanh thu (VNĐ)": totalRevenue,
          });
          
          const wsDay = XLSX.utils.json_to_sheet(dayData);
          XLSX.utils.book_append_sheet(wb, wsDay, `Ngày ${day}`);
        }
      }
      
      // Tạo worksheet tất cả sách
      const allBooksData = details.map(item => {
        return {
          "Mã sách": item.id,
          "Tên sách": item.title,
          "Giá bán (VNĐ)": Number(item.price) || 0,
          [viewType === 'monthly' ? "Tháng" : "Ngày"]: viewType === 'monthly' ? Number(item.month) : Number(item.day),
          "Số lượng bán": Number(item.quantity_sold) || 0,
          "Doanh thu (VNĐ)": Number(item.revenue) || 0,
        };
      });
      
      // Thêm tổng cộng
      const totalRevenue = allBooksData.reduce((sum, book) => sum + book["Doanh thu (VNĐ)"], 0);
      const totalSold = allBooksData.reduce((sum, book) => sum + book["Số lượng bán"], 0);
      
      allBooksData.push({
        "Mã sách": "",
        "Tên sách": "TỔNG CỘNG",
        "Giá bán (VNĐ)": "",
        [viewType === 'monthly' ? "Tháng" : "Ngày"]: "",
        "Số lượng bán": totalSold,
        "Doanh thu (VNĐ)": totalRevenue,
      });
      
      const wsAllBooks = XLSX.utils.json_to_sheet(allBooksData);
      XLSX.utils.book_append_sheet(wb, wsAllBooks, "Tất cả sách");
      
      // Xuất file Excel
      const fileName = viewType === "daily" 
        ? `bao-cao-chi-tiet-doanh-thu-thang-${month}-${year}.xlsx`
        : `bao-cao-chi-tiet-doanh-thu-nam-${year}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo Excel");
    } finally {
      setIsExporting(false);
    }
  };

    if (data === undefined) {
    return (
      <div className="loading-message">
        Đang tải dữ liệu...
      </div>
    );
  }
  if (viewType === "daily") {
    console.log("RevenueTable - daily view data:", data);
    const hasData = data && Array.isArray(data.daily) && data.daily.some(dayData => 
      Number(dayData.totalRevenue) > 0 || Number(dayData.totalSold) > 0
    );
    if (!data || !Array.isArray(data.daily) || !hasData) {
      return (
        <div className="error-message">
          Không có dữ liệu cho tháng {month}/{year}.
        </div>
      );
    }
    return renderDailyView(data.daily, month, year, isExporting, setIsExporting);
  }
  
  // Handle monthly view
  if (!data || !Array.isArray(data.monthly) || data.monthly.length === 0) {
    return (
      <div className="error-message">
        Không có dữ liệu cho năm {year}.
      </div>
    );
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const revenueByMonth = months.map((m) => {
    const found = data.monthly.find((item) => Number(item.month) === m);
    return found
      ? {
          totalRevenue: Number(found.totalRevenue) || 0,
          totalSold: Number(found.totalSold) || 0,
        }
      : { totalRevenue: 0, totalSold: 0 };
  });
  const chartData = {
    labels: months.map((m) => `Tháng ${m}`),    datasets: [      {
        type: 'line',
        label: "Tổng doanh thu (VNĐ)",
        data: revenueByMonth.map((d) => d.totalRevenue),
        backgroundColor: "#FF7043",
        yAxisID: "y2",
        fill: false,
        borderColor: "#FF7043",
        borderWidth: 3,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        type: 'bar',
        label: "Tổng số lượng sách bán",
        data: revenueByMonth.map((d) => d.totalSold),
        backgroundColor: "#48B162",
        yAxisID: "y1",
        borderColor: "#36964e",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.datasetIndex === 0) {
              return (
                context.dataset.label +
                ": " +
                Number(context.parsed.y).toLocaleString("vi-VN") +
                " VNĐ"
              );
            }
            return (
              context.dataset.label +
              ": " +
              Number(context.parsed.y).toLocaleString("vi-VN")
            );
          },
        },
      },
    },    scales: {
      y1: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Tổng số lượng sách bán" },
        beginAtZero: true,
      },
      y2: {
        type: "linear",
        position: "right",
        title: { display: true, text: "Tổng doanh thu (VNĐ)" },
        ticks: {
          callback: (value) => Number(value).toLocaleString("vi-VN"),
        },
        grid: { drawOnChartArea: false },
        beginAtZero: true,
      },
    },
  };
  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3 className="chart-section-title">
          {viewType === "daily"
            ? `Biểu đồ doanh thu & số lượng sách bán (${month}/${year})`
            : `Biểu đồ doanh thu & số lượng sách bán năm ${year}`}
        </h3>
        <div className="export-buttons">
          <button className="export-excel-btn btn" onClick={exportToExcel} disabled={isExporting}>
            <i className="fas fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>
      <div id="revenue-chart">
        <Bar data={chartData} options={options} height={130} />
      </div>
      <div className="revenue-summary">
        <h4>Tổng kết năm {year}</h4>
        <div className="summary-items">
          <div className="summary-item">
            <span className="label">Tổng doanh thu:</span>
            <span className="value">
              {revenueByMonth.reduce((sum, item) => sum + item.totalRevenue, 0).toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Tổng số sách bán:</span>
            <span className="value">
              {revenueByMonth.reduce((sum, item) => sum + item.totalSold, 0).toLocaleString('vi-VN')} cuốn
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Function to render daily view
const renderDailyView = (dailyData, month, year, isExporting, setIsExporting) => {
  // Convert month to Vietnamese month name
  const monthNames = [
    'Một', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 
    'Bảy', 'Tám', 'Chín', 'Mười', 'Mười một', 'Mười hai'
  ];
  
  const vietnameseMonth = monthNames[parseInt(month) - 1];
  
  // Định nghĩa hàm exportToExcel cho view theo ngày
  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Chuẩn bị dữ liệu cho Excel
      const excelData = dailyData.map((item, index) => ({
        'STT': index + 1,
        'Ngày': `${item.day}/${month}/${year}`,
        'Số lượng sách bán': Number(item.totalSold).toLocaleString('vi-VN'),
        'Doanh thu (VNĐ)': Number(item.totalRevenue).toLocaleString('vi-VN')
      }));

      // Thêm dòng tổng kết
      const totalSold = dailyData.reduce((sum, item) => sum + Number(item.totalSold), 0);
      const totalRevenue = dailyData.reduce((sum, item) => sum + Number(item.totalRevenue), 0);
      
      excelData.push({
        'STT': '',
        'Ngày': 'TỔNG CỘNG',
        'Số lượng sách bán': totalSold.toLocaleString('vi-VN'),
        'Doanh thu (VNĐ)': totalRevenue.toLocaleString('vi-VN')
      });

      // Tạo workbook và worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      
      // Tiêu đề cho file Excel
      XLSX.utils.sheet_add_aoa(worksheet, [
        [`BÁO CÁO DOANH THU THEO NGÀY - THÁNG ${month}/${year}`],
        [`Xuất lúc: ${new Date().toLocaleString('vi-VN')}`],
        [''] // Dòng trống trước dữ liệu
      ], { origin: 'A1' });

      // Thiết lập độ rộng cột
      const columnWidths = [
        { wch: 5 },  // STT
        { wch: 15 }, // Ngày
        { wch: 20 }, // Số lượng sách bán
        { wch: 25 }, // Doanh thu (VNĐ)
      ];
      worksheet['!cols'] = columnWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, `Doanh thu T${month}-${year}`);
      
      // Xuất file Excel
      XLSX.writeFile(workbook, `bao-cao-doanh-thu-thang-${month}-${year}.xlsx`);
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo Excel");
    } finally {
      setIsExporting(false);
    }
  };
  
    // Prepare chart data
  const chartData = {
    labels: dailyData.map((d) => `N${d.day}`),
    datasets: [
      {
        type: 'line',
        label: "Tổng doanh thu (VNĐ)",
        data: dailyData.map((d) => d.totalRevenue),
        backgroundColor: "#FF7043",
        yAxisID: "y2",
        fill: false,
        borderColor: "#FF7043",
        borderWidth: 3,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        type: 'bar',
        label: "Tổng số lượng sách bán",
        data: dailyData.map((d) => d.totalSold),
        backgroundColor: "#48B162",
        yAxisID: "y1",
        borderColor: "#36964e",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.datasetIndex === 0) {
              return (
                context.dataset.label +
                ": " +
                Number(context.parsed.y).toLocaleString("vi-VN") +
                " VNĐ"
              );
            }
            return (
              context.dataset.label +
              ": " +
              Number(context.parsed.y).toLocaleString("vi-VN")
            );
          },
        },
      },
    },    scales: {
      y1: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Tổng số lượng sách bán" },
        beginAtZero: true,
      },
      y2: {
        type: "linear",
        position: "right",
        title: { display: true, text: "Tổng doanh thu (VNĐ)" },
        ticks: {
          callback: (value) => Number(value).toLocaleString("vi-VN"),
        },
        grid: { drawOnChartArea: false },
        beginAtZero: true,
      },
    },
  };  
  const exportToPDF = async () => {
    try {
      const chartElement = document.getElementById("revenue-chart-daily");
      if (!chartElement) return;

      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
      // Create title as image to support Vietnamese
      const title = `Báo cáo doanh thu & số lượng sách bán - Tháng ${month}/${year}`;
    
      const titleCanvas = document.createElement('canvas');
      const titleCtx = titleCanvas.getContext('2d');
      titleCanvas.width = 1400;
      titleCanvas.height = 60;
      titleCtx.fillStyle = '#ffffff';
      titleCtx.fillRect(0, 0, titleCanvas.width, titleCanvas.height);
      titleCtx.fillStyle = '#000000';
      titleCtx.font = 'bold 30px Arial, sans-serif';
      titleCtx.textAlign = 'center';
      titleCtx.fillText(title, titleCanvas.width / 2, 40);
      
      const titleImgData = titleCanvas.toDataURL("image/png");
      pdf.addImage(titleImgData, "PNG", 10, 5, 277, 15);
      
      pdf.addImage(imgData, "PNG", 10, 25, imgWidth, imgHeight);
      
      // Add revenue summary as image
      const totalRevenue = dailyData.reduce((sum, item) => sum + item.totalRevenue, 0);
      const totalSold = dailyData.reduce((sum, item) => sum + item.totalSold, 0);
      
      const summaryCanvas = document.createElement('canvas');
      const summaryCtx = summaryCanvas.getContext('2d');
      summaryCanvas.width = 1200;
      summaryCanvas.height = 80;
      summaryCtx.fillStyle = '#ffffff';
      summaryCtx.fillRect(0, 0, summaryCanvas.width, summaryCanvas.height);
      summaryCtx.fillStyle = '#000000';
      summaryCtx.font = 'bold 24px Arial, sans-serif';
      summaryCtx.textAlign = 'left';
      summaryCtx.fillText(`Tổng kết tháng ${month}/${year}:`, 20, 30);
      
      summaryCtx.font = '20px Arial, sans-serif';
      summaryCtx.fillText(`Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')} VNĐ`, 20, 55);
      summaryCtx.fillText(`Tổng số sách bán: ${totalSold.toLocaleString('vi-VN')} cuốn`, 450, 55);
      
      const summaryImgData = summaryCanvas.toDataURL("image/png");
      pdf.addImage(summaryImgData, "PNG", 10, imgHeight + 35, 277, 20);
      
      // Add timestamp as image
      const timestampCanvas = document.createElement('canvas');
      const timestampCtx = timestampCanvas.getContext('2d');
      timestampCanvas.width = 600;
      timestampCanvas.height = 40;
      timestampCtx.fillStyle = '#ffffff';
      timestampCtx.fillRect(0, 0, timestampCanvas.width, timestampCanvas.height);
      timestampCtx.fillStyle = '#000000';
      timestampCtx.font = '16px Arial, sans-serif';
      const timestamp = `Xuất lúc: ${new Date().toLocaleString("vi-VN")}`;
      timestampCtx.fillText(timestamp, 10, 25);
      
      const timestampImgData = timestampCanvas.toDataURL("image/png");
      pdf.addImage(timestampImgData, "PNG", 15, imgHeight + 60, 120, 8);
      
      pdf.save(`bao-cao-doanh-thu-ngay-${month}-${year}.pdf`);
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo PDF");
    }
  };

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3 className="chart-section-title">
          Biểu đồ doanh thu & số lượng sách bán ({month}/{year})
        </h3>
        <div className="export-buttons">
          <button className="export-excel-btn btn" onClick={exportToExcel} disabled={isExporting}>
            <i className="fas fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>
      <div id="revenue-chart-daily">
        <Bar data={chartData} options={options} height={130} />
      </div>
      <div className="revenue-summary">
        <h4>Tổng kết tháng {month}/{year}</h4>
        <div className="summary-items">
          <div className="summary-item">
            <span className="label">Tổng doanh thu:</span>
            <span className="value">
              {dailyData.reduce((sum, item) => sum + item.totalRevenue, 0).toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Tổng số sách bán:</span>
            <span className="value">
              {dailyData.reduce((sum, item) => sum + item.totalSold, 0).toLocaleString('vi-VN')} cuốn
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueTable;
