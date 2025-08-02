
import axios from "axios";

export const getRevenueByYear = async (year, type = "all") => {
  let url = `/api/reports/revenue-all?year=${year}`;
  if (type === "offline") url = `/api/reports/revenue-offline?year=${year}`;
  if (type === "online") url = `/api/reports/revenue-online?year=${year}`;
  const res = await axios.get(url);
  return res.data;
};

export const getDailyRevenueByMonth = async (month, year) => {
  const res = await axios.get(`/api/reports/daily-revenue?month=${month}&year=${year}`);
  return res.data;
};


export const getDailyRevenueByMonthType = async (month, year, type = "all") => {
  let url = `/api/reports/daily-revenue-all?month=${month}&year=${year}`;
  if (type === "offline") url = `/api/reports/daily-revenue-offline?month=${month}&year=${year}`;
  if (type === "online") url = `/api/reports/daily-revenue-online?month=${month}&year=${year}`;
  const res = await axios.get(url);
  return res.data;
};

export const getTop10MostSoldBooks = async (month, year, type = "all") => {
  let url = `/api/reports/top10-all?month=${month}&year=${year}`;
  if (type === "offline") url = `/api/reports/top10-offline?month=${month}&year=${year}`;
  if (type === "online") url = `/api/reports/top10-online?month=${month}&year=${year}`;
  const res = await axios.get(url);
  return res.data;
};

// Lấy chi tiết doanh thu của từng sách theo tháng trong năm
export const getBookRevenueDetailsByYear = async (year, type = "all") => {
  const url = `/api/reports/book-revenue-by-year?year=${year}&type=${type}`;
  const res = await axios.get(url);
  return res.data;
};

// Lấy chi tiết doanh thu của từng sách theo ngày trong tháng
export const getBookRevenueDetailsByMonth = async (month, year, type = "all") => {
  const url = `/api/reports/book-revenue-by-month?month=${month}&year=${year}&type=${type}`;
  const res = await axios.get(url);
  return res.data;
};
