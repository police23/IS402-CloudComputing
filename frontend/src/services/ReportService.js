// Lấy thống kê doanh thu và số lượng sách bán theo ngày trong tháng cho từng loại
export const getDailyRevenueByMonthType = async (month, year, type = "all") => {
  let url = `/api/reports/daily-revenue-all?month=${month}&year=${year}`;
  if (type === "offline") url = `/api/reports/daily-revenue-offline?month=${month}&year=${year}`;
  if (type === "online") url = `/api/reports/daily-revenue-online?month=${month}&year=${year}`;
  const res = await axios.get(url);
  return res.data;
};
import axios from "axios";

// Lấy thống kê doanh thu và số lượng sách bán theo 12 tháng của năm

// Lấy thống kê doanh thu và số lượng sách bán theo 12 tháng của năm, theo loại thống kê
export const getRevenueByYear = async (year, type = "all") => {
  let url = `/api/reports/revenue-all?year=${year}`;
  if (type === "offline") url = `/api/reports/revenue-offline?year=${year}`;
  if (type === "online") url = `/api/reports/revenue-online?year=${year}`;
  const res = await axios.get(url);
  return res.data;
};

// Lấy thống kê doanh thu và số lượng sách bán theo ngày trong tháng
export const getDailyRevenueByMonth = async (month, year) => {
  const res = await axios.get(`http://localhost:5000/api/reports/daily-revenue?month=${month}&year=${year}`);
  return res.data;
};

// Lấy top 10 sách bán chạy nhất theo tháng và năm (endpoint mới)
export const getTop10MostSoldBooks = async (month, year, type = "all") => {
  let url = `/api/reports/top10-all?month=${month}&year=${year}`;
  if (type === "offline") url = `/api/reports/top10-offline?month=${month}&year=${year}`;
  if (type === "online") url = `/api/reports/top10-online?month=${month}&year=${year}`;
  const res = await axios.get(url);
  return res.data;
};
