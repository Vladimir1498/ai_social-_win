const crypto = require("crypto");

function validateInitData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get("hash");
  urlParams.delete("hash");
  urlParams.sort();

  let dataCheckString = "";
  for (const [key, value] of urlParams.entries()) {
    dataCheckString += `${key}=${value}\n`;
  }
  dataCheckString = dataCheckString.slice(0, -1);

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  return calculatedHash === hash;
}

module.exports = (req, res, next) => {
  const initData = req.headers["x-init-data"];
  if (!initData) {
    return res.status(401).json({ error: "No initData provided" });
  }

  const botToken = process.env.BOT_TOKEN;
  if (!validateInitData(initData, botToken)) {
    return res.status(401).json({ error: "Invalid initData" });
  }

  // Parse user data
  const urlParams = new URLSearchParams(initData);
  const user = JSON.parse(urlParams.get("user"));
  req.user = user;

  next();
};
