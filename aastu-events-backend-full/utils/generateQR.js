const QRCode = require("qrcode");

const generateQR = async (data) => {
  return await QRCode.toDataURL(
    JSON.stringify(data),
  );
};

module.exports = generateQR;