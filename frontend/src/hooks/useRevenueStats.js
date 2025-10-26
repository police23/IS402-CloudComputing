import { useEffect, useState } from "react";
import axios from "axios";
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

// type: 'all' | 'offline' | 'online'
// viewType: 'monthly' | 'daily'
// Nếu viewType === 'monthly' chỉ cần year, nếu 'daily' cần cả month và year
const useRevenueStats = (type, viewType, year, month) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!year || (viewType === 'daily' && !month)) return;
    setLoading(true);
    setError(null);
    setData(undefined);

    let url = "";
    if (viewType === "monthly") {
      // Theo tháng, lấy cho cả năm, theo loại thống kê
      if (type === "offline") url = `${API_BASE}/reports/revenue-offline?year=${year}`;
      else if (type === "online") url = `${API_BASE}/reports/revenue-online?year=${year}`;
      else url = `${API_BASE}/reports/revenue-all?year=${year}`;
    } else if (viewType === "daily") {
      // Theo ngày, lấy theo tháng và loại thống kê
      if (type === "offline") url = `${API_BASE}/reports/daily-revenue-offline?month=${month}&year=${year}`;
      else if (type === "online") url = `${API_BASE}/reports/daily-revenue-online?month=${month}&year=${year}`;
      else url = `${API_BASE}/reports/daily-revenue-all?month=${month}&year=${year}`;
    }

    axios
      .get(url)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || "Lỗi khi lấy dữ liệu"))
      .finally(() => setLoading(false));
  }, [type, viewType, year, month]);

  return { data, loading, error };
};

export default useRevenueStats;
