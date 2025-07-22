import React, { useState, useEffect } from "react";
import RevenueChart from "../../components/charts/RevenueChart";
import Top10BooksChart from "../../components/charts/Top10BooksChart";
import StockChart from "../../components/charts/StockChart";
import ImportBooksChart from "../../components/charts/ImportBooksChart";
import "./ReportStatistics.css";
import { getRevenueByYear, getTop10MostSoldBooks, getDailyRevenueByMonth } from "../../services/reportService";
import { getAllBooks } from "../../services/BookService";
import { getAllImports, getImportsByMonth, getImportDataByMonth, getImportDataByYear } from "../../services/ImportService";

const TABS = [
  { key: "revenue", label: "Doanh thu & số lượng sách bán" },
  { key: "top10", label: "Top 10 sách bán chạy" },
  { key: "stock", label: "Tồn kho" },
  { key: "import", label: "Nhập kho" },
];

const typeLabels = {
  all: "Tất cả",
  offline: "Offline",
  online: "Online"
};

const ReportStatistics = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const [month, setMonth] = useState(4);
  const [year, setYear] = useState(2025);
  const [revenueData, setRevenueData] = useState(undefined);
  const [dailyRevenueData, setDailyRevenueData] = useState(undefined);
  const [revenueViewType, setRevenueViewType] = useState("monthly"); // 'monthly' or 'daily'
  const [revenueType, setRevenueType] = useState("all"); // Thêm state cho loại thống kê doanh thu
  const [top10Books, setTop10Books] = useState(undefined);
  const [stockData, setStockData] = useState(undefined);
  const [importData, setImportData] = useState(undefined);
  const [dailyImportData, setDailyImportData] = useState(undefined);
  const [importViewType, setImportViewType] = useState("monthly"); // 'monthly' or 'daily'
  const [top10Type, setTop10Type] = useState("all"); // Thêm state cho loại thống kê

  useEffect(() => {
    if (activeTab === "revenue") {
      if (revenueViewType === "monthly") {
        setRevenueData(undefined);
        getRevenueByYear(year, revenueType)
          .then((data) => {
            // Đảm bảo data luôn là object có key 'monthly'
            if (Array.isArray(data)) {
              setRevenueData({ monthly: data });
            } else if (data && Array.isArray(data.monthly)) {
              setRevenueData(data);
            } else {
              setRevenueData({ monthly: [] });
            }
          })
          .catch(() => setRevenueData(null));
      } else if (revenueViewType === "daily") {
        setDailyRevenueData(undefined);
        getDailyRevenueByMonth(month, year, revenueType)
          .then((data) => {
            console.log("Daily revenue data received:", data);
            setDailyRevenueData(data);
          })
          .catch((error) => {
            console.error("Error fetching daily revenue data:", error);
            setDailyRevenueData(null);
          });
      }
    }
    if (activeTab === "top10") {
      setTop10Books(undefined);
      getTop10MostSoldBooks(month, year, top10Type)
        .then((books) => {
          setTop10Books(books);
        })
        .catch(() => setTop10Books(null));
    }
    if (activeTab === "stock") {
      setStockData(undefined);
      getAllBooks()
        .then((books) => setStockData({ books }))
        .catch(() => setStockData(null));
    }      if (activeTab === "import") {
      if (importViewType === "monthly") {
        setImportData(undefined);
        getImportDataByYear(year)
          .then((data) => {
            console.log("Import data received:", data);
            setImportData(data);
          })
          .catch((error) => {
            console.error("Error fetching import data:", error);
            setImportData(null);
          });
      } else if (importViewType === "daily") {
        setDailyImportData(undefined);
        getImportDataByMonth(year, month)
          .then((data) => {
            console.log("Daily import data received:", data);
            setDailyImportData(data);
          })
          .catch((error) => {
            console.error("Error fetching daily import data:", error);
            setDailyImportData(null);
          });
      }
    }
  }, [activeTab, year, month, revenueViewType, importViewType, top10Type, revenueType]);

  return (
    <div className="report-statistics-container">
      <div className="report-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`report-tab-btn${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
        <div className="report-filter-row">
        {/* View type selector & loại thống kê cho revenue tab */}
        {activeTab === "revenue" && (
          <>
            <label>
              Loại thống kê:
              <select
                value={revenueType}
                onChange={e => setRevenueType(e.target.value)}
                style={{ marginLeft: "8px" }}
              >
                <option value="all">Tất cả</option>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </label>
            <label>
              Loại xem:
              <select
                value={revenueViewType}
                onChange={(e) => setRevenueViewType(e.target.value)}
                style={{ marginLeft: "8px" }}
              >
                <option value="monthly">Theo tháng</option>
                <option value="daily">Theo ngày</option>
              </select>
            </label>
          </>
        )}
        
        {/* View type selector for import tab */}
        {activeTab === "import" && (
          <label>
            Loại xem:
            <select
              value={importViewType}
              onChange={(e) => setImportViewType(e.target.value)}
              style={{ marginLeft: "8px" }}
            >
              <option value="monthly">Theo tháng</option>
              <option value="daily">Theo ngày</option>
            </select>
          </label>
        )}
        
        {/* Loại thống kê cho top 10 sách bán chạy */}
        {activeTab === "top10" && (
          <label>
            Loại thống kê:
            <select
              value={top10Type}
              onChange={e => setTop10Type(e.target.value)}
              style={{ marginLeft: "8px" }}
            >
              <option value="all">Tất cả</option>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </label>
        )}
        
        {/* Month selector */}
        {(activeTab === "top10" || 
          (activeTab === "revenue" && revenueViewType === "daily") ||
          (activeTab === "import" && importViewType === "daily")) && (
          <label>
            Tháng:
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
        )}
        
        {/* Year selector */}
        {(activeTab !== "stock" || activeTab === "import" || activeTab === "revenue" || activeTab === "top10") && (
          <label>
            Năm:
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2020}
              max={2100}
            />
          </label>
        )}
      </div>
      
      {activeTab === "revenue" && revenueViewType === "monthly" && (
        <RevenueChart data={revenueData} year={year} viewType="monthly" type={revenueType} />
      )}
      
      {activeTab === "revenue" && revenueViewType === "daily" && (
        <RevenueChart data={dailyRevenueData} year={year} month={month} viewType="daily" type={revenueType} />
      )}
      
      {activeTab === "top10" && (
        <Top10BooksChart books={top10Books} month={month} year={year} type={top10Type} />
      )}
      
      {activeTab === "stock" && (
        <StockChart data={stockData} />
      )}
        {activeTab === "import" && importViewType === "monthly" && (
        <ImportBooksChart data={importData} year={year} viewType="monthly" />
      )}
      
      {activeTab === "import" && importViewType === "daily" && (
        <ImportBooksChart data={dailyImportData} year={year} month={month} viewType="daily" />
      )}
    </div>
  );
};

export default ReportStatistics;