import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import "./Top10BooksChart.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Top10BooksTable = ({ books, month, year }) => {
  console.log("Top10BooksTable props:", { books, month, year }); // Debug log
  console.log("Month type:", typeof month, "Month value:", month); // Additional debug
  console.log("Year type:", typeof year, "Year value:", year); // Additional debug

  const exportToPDF = async () => {
    try {
      const chartElement = document.getElementById("top10-books-chart");
      if (!chartElement) return;

      const canvas = await html2canvas(chartElement, {
        scale: 10,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("landscape", "mm", "a4");

      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create title as image to support Vietnamese
      const displayMonth = month !== undefined && month !== null ? month : new Date().getMonth() + 1;
      const displayYear = year !== undefined && year !== null ? year : new Date().getFullYear();
      const title = `Báo cáo Top 10 sách bán chạy nhất - Tháng ${displayMonth}/${displayYear}`;

      const titleCanvas = document.createElement("canvas");
      const titleCtx = titleCanvas.getContext("2d");
      titleCanvas.width = 1400;
      titleCanvas.height = 60;
      titleCtx.fillStyle = "#ffffff";
      titleCtx.fillRect(0, 0, titleCanvas.width, titleCanvas.height);
      titleCtx.fillStyle = "#000000";
      titleCtx.font = "bold 32px Arial, sans-serif";
      titleCtx.textAlign = "center";
      titleCtx.fillText(title, titleCanvas.width / 2, 40);

      const titleImgData = titleCanvas.toDataURL("image/png", 1.0);
      pdf.addImage(titleImgData, "PNG", 10, 5, 277, 15);

      // Add chart
      pdf.addImage(imgData, "PNG", 10, 25, imgWidth, imgHeight);

      // Add timestamp as image
      const timestampCanvas = document.createElement("canvas");
      const timestampCtx = timestampCanvas.getContext("2d");
      timestampCanvas.width = 600;
      timestampCanvas.height = 40;
      timestampCtx.fillStyle = "#ffffff";
      timestampCtx.fillRect(0, 0, timestampCanvas.width, timestampCanvas.height);
      timestampCtx.fillStyle = "#000000";
      timestampCtx.font = "16px Arial, sans-serif";
      const timestamp = `Xuất lúc: ${new Date().toLocaleString("vi-VN")}`;
      timestampCtx.fillText(timestamp, 10, 25);

      const timestampImgData = timestampCanvas.toDataURL("image/png", 1.0);
      pdf.addImage(timestampImgData, "PNG", 15, imgHeight + 35, 120, 8);

      // Save the PDF
      const fileName = `bao-cao-top-10-sach-ban-chay-thang-${displayMonth}-${displayYear}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo PDF");
    }
  };

  const exportToExcel = () => {
    try {
      const displayMonth = month !== undefined && month !== null ? month : new Date().getMonth() + 1;
      const displayYear = year !== undefined && year !== null ? year : new Date().getFullYear();
      
      // Chuẩn bị dữ liệu cho Excel
      const excelData = books.map((book, index) => ({
        'STT': index + 1,
        'Tên sách': book.title,
        'Số lượng bán': Number(book.total_sold).toLocaleString('vi-VN'),
        'Giá bán (VNĐ)': Number(book.price).toLocaleString('vi-VN')
      }));

      // Tạo workbook và worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      
      // Tiêu đề cho file Excel
      XLSX.utils.sheet_add_aoa(worksheet, [
        [`BÁO CÁO TOP 10 SÁCH BÁN CHẠY NHẤT - THÁNG ${displayMonth}/${displayYear}`],
        [`Xuất lúc: ${new Date().toLocaleString('vi-VN')}`],
        [''] // Dòng trống trước dữ liệu
      ], { origin: 'A1' });

      // Thiết lập độ rộng cột
      const columnWidths = [
        { wch: 5 },   // STT
        { wch: 40 },  // Tên sách
        { wch: 15 },  // Số lượng bán
        { wch: 18 },  // Giá bán (VNĐ)
      ];
      worksheet['!cols'] = columnWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, `Top10 T${displayMonth}-${displayYear}`);
      
      // Xuất file Excel
      XLSX.writeFile(workbook, `bao-cao-top-10-sach-ban-chay-thang-${displayMonth}-${displayYear}.xlsx`);
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo Excel");
    }
  };

  if (!books || books.length === 0)
    return (
      <div className="error-message">
        Không có dữ liệu cho báo cáo này.
      </div>
    );

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: books.map((book) => book.title),
    datasets: [
      {
        label: "Số lượng bán",
        data: books.map((book) => book.total_sold),
        backgroundColor: "#095e5a",
        borderColor: "#074c48",
        borderWidth: 1,
      },
    ],
  }; // Plugin tùy chỉnh để hiển thị số liệu
  const datalabelsPlugin = {
    id: "datalabels",
    afterDatasetsDraw: function (chart) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((bar, index) => {
          const data = dataset.data[index];
          ctx.fillStyle = "#fff";
          ctx.font = "bold 14px Arial";
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.fillText(
            Number(data).toLocaleString("vi-VN"),
            bar.x - 5,
            bar.y
          );
        });
      });
    },
  };

  const options = {
    indexAxis: "y", // Tạo horizontal bar chart
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${Number(context.parsed.x).toLocaleString(
              "vi-VN"
            )}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số lượng bán",
        },
        ticks: {
          callback: (value) => Number(value).toLocaleString("vi-VN"),
        },
      },
      y: {
        title: {
          display: true,
          text: "Tên sách",
        },
      },
    },
  };
  const displayMonth = month !== undefined && month !== null ? month : new Date().getMonth() + 1;
  const displayYear = year !== undefined && year !== null ? year : new Date().getFullYear();

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3 className="chart-section-title">
          Top 10 sách bán chạy nhất - Tháng {displayMonth}/{displayYear}
        </h3>
        <div className="export-buttons">
          <button className="export-excel-btn btn" onClick={exportToExcel}>
            <i className="fas fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>
      <div id="top10-books-chart">
        <Bar
          data={chartData}
          options={options}
          plugins={[datalabelsPlugin]}
          height={150} // Tăng chiều cao biểu đồ
        />
      </div>
    </div>
  );
};

export default Top10BooksTable;

