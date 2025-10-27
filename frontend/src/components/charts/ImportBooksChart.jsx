import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineController,
  BarController,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import "./ImportBooksChart.css"; // CSS riêng cho ImportBooksTable
import { getImportDataByMonth, getImportDataByYear } from "../../services/ImportService";

ChartJS.register(LineController, BarController, LineElement, PointElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Function to render daily view
function renderDailyView(dailyData, month, year) {
  // Convert month to Vietnamese month name
  const monthNames = [
    'Một', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 
    'Bảy', 'Tám', 'Chín', 'Mười', 'Mười một', 'Mười hai'
  ];
  
  const vietnameseMonth = monthNames[parseInt(month) - 1];
    // Prepare chart data
  const chartData = {
    labels: dailyData.map((d) => `N${d.day}`),
    datasets: [
      {
        type: 'line',
        label: "Tổng giá trị nhập (VNĐ)",
        data: dailyData.map((d) => Number(d.totalCost) || 0),
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
        label: "Tổng số lượng sách nhập",
        data: dailyData.map((d) => Number(d.totalBooks) || 0),
        backgroundColor: "#1976d2",
        yAxisID: "y1",
        borderColor: "#1565c0",
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
    },
    scales: {
      y1: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Tổng số lượng sách nhập" },
        beginAtZero: true,
      },
      y2: {
        type: "linear",
        position: "right",
        title: { display: true, text: "Tổng giá trị nhập (VNĐ)" },
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
      const chartElement = document.getElementById("import-chart-daily");
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
      const title = `Báo cáo nhập kho - Tháng ${month}/${year}`;
    
      const titleCanvas = document.createElement('canvas');
      const titleCtx = titleCanvas.getContext('2d');
      titleCanvas.width = 1400;
      titleCanvas.height = 60;
      titleCtx.fillStyle = '#ffffff';
      titleCtx.fillRect(0, 0, titleCanvas.width, titleCanvas.height);
      titleCtx.fillStyle = '#000000';
      titleCtx.font = 'bold 32px "Times New Roman", serif';
      titleCtx.textAlign = 'center';
      titleCtx.fillText(title, titleCanvas.width / 2, 40);
      
      const titleImgData = titleCanvas.toDataURL("image/png");
      pdf.addImage(titleImgData, "PNG", 10, 5, 277, 15);
      
      // Add chart
      pdf.addImage(imgData, "PNG", 10, 25, imgWidth, imgHeight);
        // Add import summary
      const totalBooks = dailyData.reduce((sum, item) => sum + Number(item.totalBooks), 0);
      const totalCost = dailyData.reduce((sum, item) => sum + Number(item.totalCost), 0);
      
      const summaryCanvas = document.createElement('canvas');
      const summaryCtx = summaryCanvas.getContext('2d');
      summaryCanvas.width = 1200;
      summaryCanvas.height = 80;
      summaryCtx.fillStyle = '#ffffff';
      summaryCtx.fillRect(0, 0, summaryCanvas.width, summaryCanvas.height);
      summaryCtx.fillStyle = '#000000';
      summaryCtx.font = 'bold 24px "Times New Roman", serif';
      summaryCtx.textAlign = 'left';
      summaryCtx.fillText(`Tổng kết tháng ${month}/${year}:`, 20, 30);
      
      summaryCtx.font = '20px Arial, sans-serif';
      summaryCtx.fillText(`Tổng số sách nhập: ${totalBooks.toLocaleString('vi-VN')} cuốn`, 20, 55);
      summaryCtx.fillText(`Tổng giá trị: ${totalCost.toLocaleString('vi-VN')} VNĐ`, 450, 55);
      
      const summaryImgData = summaryCanvas.toDataURL("image/png");
      pdf.addImage(summaryImgData, "PNG", 10, imgHeight + 35, 277, 20);
      
      // Add timestamp
      const timestampCanvas = document.createElement('canvas');
      const timestampCtx = timestampCanvas.getContext('2d');
      timestampCanvas.width = 600;
      timestampCanvas.height = 40;
      timestampCtx.fillStyle = '#ffffff';
      timestampCtx.fillRect(0, 0, timestampCanvas.width, timestampCanvas.height);
      timestampCtx.fillStyle = '#000000';
      timestampCtx.font = '16px "Times New Roman", serif';
      const timestamp = `Xuất lúc: ${new Date().toLocaleString("vi-VN")}`;
      timestampCtx.fillText(timestamp, 10, 25);
      
      const timestampImgData = timestampCanvas.toDataURL("image/png");
      pdf.addImage(timestampImgData, "PNG", 15, imgHeight + 60, 120, 8);
      
      // Save the PDF
      const fileName = `bao-cao-nhap-kho-ngay-${month}-${year}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo PDF");
    }
  };

  const exportToExcel = () => {
    try {
      // Chuẩn bị dữ liệu cho Excel
      const excelData = dailyData.map((item, index) => ({
        'STT': index + 1,
        'Ngày': `${item.day}/${month}/${year}`,
        'Số lượng sách nhập': Number(item.totalBooks).toLocaleString('vi-VN'),
        'Giá trị nhập (VNĐ)': Number(item.totalCost).toLocaleString('vi-VN')
      }));

      // Thêm dòng tổng kết
      const totalBooks = dailyData.reduce((sum, item) => sum + Number(item.totalBooks), 0);
      const totalCost = dailyData.reduce((sum, item) => sum + Number(item.totalCost), 0);
      
      excelData.push({
        'STT': '',
        'Ngày': 'TỔNG CỘNG',
        'Số lượng sách nhập': totalBooks.toLocaleString('vi-VN'),
        'Giá trị nhập (VNĐ)': totalCost.toLocaleString('vi-VN')
      });

      // Tạo workbook và worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      
      // Tiêu đề cho file Excel
      XLSX.utils.sheet_add_aoa(worksheet, [
        [`BÁO CÁO NHẬP KHO - THÁNG ${month}/${year}`],
        [`Xuất lúc: ${new Date().toLocaleString('vi-VN')}`],
        [''] // Dòng trống trước dữ liệu
      ], { origin: 'A1' });

      // Thiết lập độ rộng cột
      const columnWidths = [
        { wch: 5 },  // STT
        { wch: 15 }, // Ngày
        { wch: 20 }, // Số lượng sách nhập
        { wch: 25 }, // Giá trị nhập (VNĐ)
      ];
      worksheet['!cols'] = columnWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, `Nhập kho T${month}-${year}`);
      
      // Xuất file Excel
      XLSX.writeFile(workbook, `bao-cao-nhap-kho-thang-${month}-${year}.xlsx`);
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo Excel");
    }
  };

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3 className="chart-section-title">
          Biểu đồ số lượng và giá trị nhập kho ({month}/{year})
        </h3>
        <div className="export-buttons">
          <button className="export-excel-btn btn" onClick={exportToExcel}>
            <i className="fas fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>
      <div id="import-chart-daily">
        <Chart type='bar' data={chartData} options={options} height={130} />
      </div>
      <div className="revenue-summary">
        <h4>Tổng kết tháng {month}/{year}</h4>
        <div className="summary-items">
          <div className="summary-item">
            <span className="label">Tổng số sách nhập:</span>            <span className="value">
              {dailyData.reduce((sum, item) => sum + Number(item.totalBooks), 0).toLocaleString('vi-VN')} cuốn
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Tổng giá trị nhập:</span>
            <span className="value">
              {dailyData.reduce((sum, item) => sum + Number(item.totalCost), 0).toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const ImportBooksTable = ({ data, year, month, viewType = "monthly" }) => {
  const exportToPDF = async () => {
    try {
      const chartElement = document.getElementById("import-chart");
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
      
      const title = viewType === "daily" 
        ? `Báo cáo nhập kho - Tháng ${month}/${year}`
        : `Báo cáo nhập kho - Năm ${year}`;
    
      const titleCanvas = document.createElement('canvas');
      const titleCtx = titleCanvas.getContext('2d');
      titleCanvas.width = 1400;
      titleCanvas.height = 60;
      titleCtx.fillStyle = '#ffffff';
      titleCtx.fillRect(0, 0, titleCanvas.width, titleCanvas.height);
      titleCtx.fillStyle = '#000000';
      titleCtx.font = 'bold 32px Arial, sans-serif';
      titleCtx.textAlign = 'center';
      titleCtx.fillText(title, titleCanvas.width / 2, 40);
      
      const titleImgData = titleCanvas.toDataURL("image/png");
      pdf.addImage(titleImgData, "PNG", 10, 5, 277, 15);
        // Add chart
      pdf.addImage(imgData, "PNG", 10, 25, imgWidth, imgHeight);
      
      // Add summary
      const totalBooks = viewType === "daily" && data?.daily 
        ? data.daily.reduce((sum, item) => sum + Number(item.totalBooks), 0)
        : importsByMonth.reduce((sum, item) => sum + Number(item.totalBooks), 0);
      
      const totalCost = viewType === "daily" && data?.daily
        ? data.daily.reduce((sum, item) => sum + Number(item.totalCost), 0)
        : importsByMonth.reduce((sum, item) => sum + Number(item.totalCost), 0);
      
      const summaryCanvas = document.createElement('canvas');
      const summaryCtx = summaryCanvas.getContext('2d');
      summaryCanvas.width = 1200;
      summaryCanvas.height = 80;
      summaryCtx.fillStyle = '#ffffff';
      summaryCtx.fillRect(0, 0, summaryCanvas.width, summaryCanvas.height);
      summaryCtx.fillStyle = '#000000';
      summaryCtx.font = 'bold 24px Arial, sans-serif';
      summaryCtx.textAlign = 'left';
      
      const periodText = viewType === "daily" ? `tháng ${month}/${year}` : `năm ${year}`;
      summaryCtx.fillText(`Tổng kết ${periodText}:`, 20, 30);
      
      summaryCtx.font = '20px Arial, sans-serif';
      summaryCtx.fillText(`Tổng số sách nhập: ${totalBooks.toLocaleString('vi-VN')} cuốn`, 20, 55);
      summaryCtx.fillText(`Tổng giá trị: ${totalCost.toLocaleString('vi-VN')} VNĐ`, 450, 55);
      
      const summaryImgData = summaryCanvas.toDataURL("image/png");
      pdf.addImage(summaryImgData, "PNG", 10, imgHeight + 35, 277, 20);
      
      // Add timestamp
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
      
      // Save the PDF
      const fileName = viewType === "daily" 
        ? `bao-cao-nhap-kho-ngay-${month}-${year}.pdf`
        : `bao-cao-nhap-kho-thang-${year}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo PDF");
    }
  };

  const exportToExcel = () => {
    try {
      let excelData = [];
      let sheetName = '';
      let fileName = '';

      if (viewType === "daily" && data?.daily) {
        // Dữ liệu theo ngày
        excelData = data.daily.map((item, index) => ({
          'STT': index + 1,
          'Ngày': `${item.day}/${month}/${year}`,
          'Số lượng sách nhập': Number(item.totalBooks).toLocaleString('vi-VN'),
          'Giá trị nhập (VNĐ)': Number(item.totalCost).toLocaleString('vi-VN')
        }));

        // Thêm dòng tổng kết
        const totalBooks = data.daily.reduce((sum, item) => sum + Number(item.totalBooks), 0);
        const totalCost = data.daily.reduce((sum, item) => sum + Number(item.totalCost), 0);
        
        excelData.push({
          'STT': '',
          'Ngày': 'TỔNG CỘNG',
          'Số lượng sách nhập': totalBooks.toLocaleString('vi-VN'),
          'Giá trị nhập (VNĐ)': totalCost.toLocaleString('vi-VN')
        });

        sheetName = `Nhập kho T${month}-${year}`;
        fileName = `bao-cao-nhap-kho-thang-${month}-${year}.xlsx`;
      } else {
        // Dữ liệu theo tháng
        excelData = importsByMonth.map((item, index) => ({
          'STT': index + 1,
          'Tháng': `Tháng ${index + 1}/${year}`,
          'Số lượng sách nhập': Number(item.totalBooks).toLocaleString('vi-VN'),
          'Giá trị nhập (VNĐ)': Number(item.totalCost).toLocaleString('vi-VN')
        }));

        // Thêm dòng tổng kết
        const totalBooks = importsByMonth.reduce((sum, item) => sum + Number(item.totalBooks), 0);
        const totalCost = importsByMonth.reduce((sum, item) => sum + Number(item.totalCost), 0);
        
        excelData.push({
          'STT': '',
          'Tháng': 'TỔNG CỘNG',
          'Số lượng sách nhập': totalBooks.toLocaleString('vi-VN'),
          'Giá trị nhập (VNĐ)': totalCost.toLocaleString('vi-VN')
        });

        sheetName = `Nhập kho ${year}`;
        fileName = `bao-cao-nhap-kho-nam-${year}.xlsx`;
      }

      // Tạo workbook và worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      
      // Tiêu đề cho file Excel
      const title = viewType === "daily" 
        ? `BÁO CÁO NHẬP KHO - THÁNG ${month}/${year}`
        : `BÁO CÁO NHẬP KHO - NĂM ${year}`;
        
      XLSX.utils.sheet_add_aoa(worksheet, [
        [title],
        [`Xuất lúc: ${new Date().toLocaleString('vi-VN')}`],
        [''] // Dòng trống trước dữ liệu
      ], { origin: 'A1' });

      // Thiết lập độ rộng cột
      const columnWidths = [
        { wch: 5 },  // STT
        { wch: 15 }, // Ngày/Tháng
        { wch: 20 }, // Số lượng sách nhập
        { wch: 25 }, // Giá trị nhập (VNĐ)
      ];
      worksheet['!cols'] = columnWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Xuất file Excel
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo Excel");
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
    console.log("ImportBooksTable - daily view data:", data);
    const hasData = data && Array.isArray(data.daily) && data.daily.some(dayData => 
      dayData.totalBooks > 0 || dayData.totalCost > 0
    );
    
    if (!data || !Array.isArray(data.daily) || !hasData) {
      return (
        <div className="error-message">
          Không có dữ liệu cho tháng {month}/{year}.
        </div>
      );
    }
    return renderDailyView(data.daily, month, year);
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
  const importsByMonth = months.map((m) => {
    const found = data.monthly.find((item) => Number(item.month) === m);
    return found
      ? {
          totalBooks: Number(found.totalBooks) || 0,
          totalCost: Number(found.totalCost) || 0,
        }
      : { totalBooks: 0, totalCost: 0 };
  });

  const chartData = {
    labels: months.map((m) => `Tháng ${m}`),
    datasets: [
      {
        type: 'line',
        label: "Tổng giá trị nhập (VNĐ)",
        data: importsByMonth.map((d) => d.totalCost),
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
        label: "Tổng số lượng sách nhập",
        data: importsByMonth.map((d) => d.totalBooks),
        backgroundColor: "#1976d2",
        yAxisID: "y1",
        borderColor: "#1565c0",
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
    },
    scales: {
      y1: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Tổng số lượng sách nhập" },
        beginAtZero: true,
      },
      y2: {
        type: "linear",
        position: "right",
        title: { display: true, text: "Tổng giá trị nhập (VNĐ)" },
        ticks: {
          callback: (value) => Number(value).toLocaleString("vi-VN"),
        },
        grid: { drawOnChartArea: false },
        beginAtZero: true,
      },
    },  };

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3 className="chart-section-title">
          Biểu đồ số lượng và giá trị nhập kho năm {year}
        </h3>
        <div className="export-buttons">
          <button className="export-excel-btn btn" onClick={exportToExcel}>
            <i className="fas fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>
      <div id="import-chart">
        <Chart type='bar' data={chartData} options={options} height={130} />
      </div>
      <div className="revenue-summary">
        <h4>Tổng kết năm {year}</h4>
        <div className="summary-items">
          <div className="summary-item">
            <span className="label">Tổng số sách nhập:</span>            <span className="value">
              {importsByMonth.reduce((sum, item) => sum + Number(item.totalBooks), 0).toLocaleString('vi-VN')} cuốn
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Tổng giá trị nhập:</span>
            <span className="value">
              {importsByMonth.reduce((sum, item) => sum + Number(item.totalCost), 0).toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportBooksTable;
