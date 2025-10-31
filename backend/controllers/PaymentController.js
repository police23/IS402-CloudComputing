const crypto = require('crypto');
const axios = require('axios');




// ZaloPay config
const zalopayAppId = '2554';
const zalopayKey1 = 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn';
const zalopayEndpoint = 'https://sb-openapi.zalopay.vn/v2/create';


const qs = require('querystring');

function getAppTransId() {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = ('0' + (date.getMonth() + 1)).slice(-2);
  const d = ('0' + date.getDate()).slice(-2);
  const rand = Math.floor(Math.random() * 100000);
  return `${y}${m}${d}_${rand}`;
}

exports.createZaloPayPayment = async (req, res) => {
  try {
  const { amount, orderInfo, redirectUrl } = req.body;
  // ZaloPay dùng embed_data.redirecturl để điều hướng trình duyệt sau khi thanh toán
  const embed_data = { redirecturl: redirectUrl };
    const items = [];
    const app_trans_id = getAppTransId();
    const order = {
      app_id: zalopayAppId,
      app_trans_id,
      app_user: 'demo',
      app_time: Date.now(),
      amount,
      item: JSON.stringify(items),
  embed_data: JSON.stringify(embed_data),
      description: orderInfo,
      bank_code: '',
  // callback_url là webhook cho backend (nếu có). Tạm thời dùng cùng giá trị để tránh null
  callback_url: redirectUrl,
  // Một số phiên bản SDK vẫn đọc redirect_url; đặt trùng để dự phòng
  redirect_url: redirectUrl
    };
    // MAC
    const data = `${zalopayAppId}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = crypto.createHmac('sha256', zalopayKey1).update(data).digest('hex');
    // Gửi body dạng form-urlencoded
    const formData = qs.stringify(order);
    const response = await axios.post(zalopayEndpoint, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      console.error('ZaloPay error:', err.response.status, err.response.data);
    } else {
      console.error('ZaloPay error:', err);
    }
    res.status(500).json({ message: 'Error ZaloPay', error: err.message, detail: err.response?.data });
  }
};