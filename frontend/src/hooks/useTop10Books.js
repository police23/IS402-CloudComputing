import { useEffect, useState } from "react";
import axios from "axios";

const useTop10Books = (type, month, year) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!month || !year) return;
    setLoading(true);
    setError(null);

  let url = `${API_BASE}/reports/top10-all?month=${month}&year=${year}`;
  if (type === "offline") url = `${API_BASE}/reports/top10-offline?month=${month}&year=${year}`;
  if (type === "online") url = `${API_BASE}/reports/top10-online?month=${month}&year=${year}`;

    axios
      .get(url)
      .then((res) => setBooks(res.data))
      .catch((err) => setError(err.message || "Lỗi khi lấy dữ liệu"))
      .finally(() => setLoading(false));
  }, [type, month, year]);

  return { books, loading, error };
};

export default useTop10Books; 