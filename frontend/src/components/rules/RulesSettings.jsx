import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faUndo,
  faBoxOpen,
  faClipboardList,
  faShoppingBasket,
  faPercent,
  faCheck,
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import "./RulesSettings.css";

const RulesSettings = () => {
  // State để lưu trữ các giá trị quy định
  const [rules, setRules] = useState({
    minImportQuantity: 150,
    minStockBeforeImport: 300,
    maxPromotionDuration: 30
  });

  // State để lưu trữ dữ liệu gốc, phục vụ cho việc hủy thay đổi
  const [originalRules, setOriginalRules] = useState({
    minImportQuantity: 150,
    minStockBeforeImport: 300,
    maxPromotionDuration: 30
  });

  // State để theo dõi trường nào đã được thay đổi
  const [changedFields, setChangedFields] = useState({});

  // State để hiển thị thông báo
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/rules");
        if (response.ok) {
          const data = await response.json();
          setRules({
            minImportQuantity: data.min_import_quantity,
            minStockBeforeImport: data.min_stock_before_import,
            maxPromotionDuration: data.max_promotion_duration,
          });
          setOriginalRules({
            minImportQuantity: data.min_import_quantity,
            minStockBeforeImport: data.min_stock_before_import,
            maxPromotionDuration: data.max_promotion_duration,
          });
        } else {
          console.error("Failed to fetch rules:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching rules:", error);
      }
    };

    fetchRules();
  }, []);

  // Xử lý khi giá trị thay đổi
  const handleChange = (field, value) => {
    // Cho phép chuỗi rỗng để người dùng có thể xóa toàn bộ và nhập lại
    if (value === "") {
      setRules({
        ...rules,
        [field]: ""
      });

      // Đánh dấu trường đã thay đổi vì hiện tại khác giá trị gốc
      setChangedFields({
        ...changedFields,
        [field]: true
      });
      return;
    }

    const numberValue = Number(value);

    // Kiểm tra nếu giá trị không phải là số hoặc là số âm
    if (isNaN(numberValue) || numberValue < 0) {
      return;
    }

    setRules({
      ...rules,
      [field]: numberValue
    });

    // Đánh dấu trường đã thay đổi
    if (originalRules[field] !== numberValue) {
      setChangedFields({
        ...changedFields,
        [field]: true
      });
    } else {
      // Nếu giá trị quay về giống ban đầu, loại bỏ khỏi danh sách các trường đã thay đổi
      const newChangedFields = { ...changedFields };
      delete newChangedFields[field];
      setChangedFields(newChangedFields);
    }
  };

  // Xử lý khi nhấn nút lưu
  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/rules", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          min_import_quantity: rules.minImportQuantity,
          min_stock_before_import: rules.minStockBeforeImport,
          max_promotion_duration: rules.maxPromotionDuration,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setOriginalRules({ ...rules });
        setChangedFields({});
        setNotification({ message: "Đã lưu thay đổi thành công!", type: "success" });
        setTimeout(() => setNotification({ message: "", type: "" }), 4000);
      } else {
        setNotification({ message: `Lỗi: ${data.error || "Không thể lưu thay đổi"}`, type: "error" });
        setTimeout(() => setNotification({ message: "", type: "" }), 4000);
      }
    } catch (error) {
      setNotification({ message: "Đã xảy ra lỗi khi lưu thay đổi!", type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 4000);
    }
  };

  // Xử lý khi nhấn nút hủy
  const handleCancel = () => {
    // Khôi phục về giá trị mặc định cứng
    setRules({
      minImportQuantity: 150,
      minStockBeforeImport: 300,
      maxPromotionDuration: 30
    });
    // Đánh dấu tất cả các trường đã thay đổi để có thể bấm Lưu
    setChangedFields({
      minImportQuantity: true,
      minStockBeforeImport: true,
      maxPromotionDuration: true
    });
  };

  // Kiểm tra xem có thay đổi nào chưa
  const hasChanges = Object.keys(changedFields).length > 0 ||
    rules.minImportQuantity !== 150 ||
    rules.minStockBeforeImport !== 300 ||
    rules.maxPromotionDuration !== 30;

  return (
    <div className="rules-settings">
      <h2 className="rules-title">THAY ĐỔI QUY ĐỊNH</h2>
      <div className="rules-description">
        Điều chỉnh các quy định áp dụng cho cửa hàng
      </div>

      <div className="rules-container">
        <div className="rules-group">
          <div className="rule-item">
            <div className="rule-icon">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="rule-content">
              <label htmlFor="minImportQuantity" className="rule-label">
                Số lượng nhập tối thiểu
                <span className="rule-hint">(Mỗi lần nhập hàng)</span>
              </label>
              <div className="rule-input-group">
                <input
                  id="minImportQuantity"
                  type="number"
                  min="0"
                  value={rules.minImportQuantity}
                  onChange={(e) => handleChange("minImportQuantity", e.target.value)}
                  className={changedFields.minImportQuantity ? "changed" : ""}
                />
                <span className="input-suffix">sách</span>
              </div>
              <div className="rule-description">
                Quy định số lượng sách ít nhất phải nhập trong mỗi lần nhập hàng
              </div>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon">
              <FontAwesomeIcon icon={faClipboardList} />
            </div>
            <div className="rule-content">
              <label htmlFor="minStockBeforeImport" className="rule-label">
                Lượng tồn tối thiểu trước khi nhập
                <span className="rule-hint">(Để được phép nhập)</span>
              </label>
              <div className="rule-input-group">
                <input
                  id="minStockBeforeImport"
                  type="number"
                  min="0"
                  value={rules.minStockBeforeImport}
                  onChange={(e) => handleChange("minStockBeforeImport", e.target.value)}
                  className={changedFields.minStockBeforeImport ? "changed" : ""}
                />
                <span className="input-suffix">sách</span>
              </div>
              <div className="rule-description">
                Chỉ cho phép nhập sách khi số lượng sách đó trong kho thấp hơn hoặc bằng giá trị này
              </div>
            </div>
          </div>

          <div className="rule-item">
            <div className="rule-icon">
              <FontAwesomeIcon icon={faPercent} />
            </div>
            <div className="rule-content">
              <label htmlFor="maxPromotionDuration" className="rule-label">
                Thời gian áp dụng khuyến mãi tối đa
                <span className="rule-hint">(Thời lượng tối đa cho một khuyến mãi)</span>
              </label>
              <div className="rule-input-group">
                <input
                  id="maxPromotionDuration"
                  type="number"
                  min="1"
                  value={rules.maxPromotionDuration}
                  onChange={(e) => handleChange("maxPromotionDuration", e.target.value)}
                  className={changedFields.maxPromotionDuration ? "changed" : ""}
                />
                <span className="input-suffix">ngày</span>
              </div>
              <div className="rule-description">
                Thời gian tối đa cho phép áp dụng một chương trình khuyến mãi
              </div>
            </div>
          </div>
        </div>
      </div>

      {notification.message && (
        <div className={`notification ${notification.type === "error" ? "error" : "success"}`} style={{ marginTop: 16 }}>
          <FontAwesomeIcon icon={notification.type === "error" ? faExclamationCircle : faCheck} style={{ marginRight: 8 }} />
          {notification.message}
        </div>
      )}

      <div className="rules-actions">
        <button
          className="cancel-button"
          onClick={handleCancel}
        >
          <FontAwesomeIcon icon={faUndo} />
          Khôi phục mặc định
        </button>
        <button
          className="save-button"
          onClick={handleSave}
          disabled={!hasChanges}
        >
          <FontAwesomeIcon icon={faSave} />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default RulesSettings;