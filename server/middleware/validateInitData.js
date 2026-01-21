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
  console.log("Headers:", req.headers);
  const initData = req.headers["x-init-data"];
  console.log("initData:", initData);
  if (!initData) {
    console.log("No initData provided");
    return res.status(401).json({ error: "No initData provided" });
  }

  const botToken = process.env.BOT_TOKEN;
  console.log("BOT_TOKEN:", botToken ? "present" : "missing");
  if (!validateInitData(initData, botToken)) {
    console.log("Invalid initData");
    return res.status(401).json({ error: "Invalid initData" });
  }

  // Parse user data
  const urlParams = new URLSearchParams(initData);
  const user = JSON.parse(urlParams.get("user"));
  req.user = user;
  console.log("User validated:", user.id);

  next();
};
