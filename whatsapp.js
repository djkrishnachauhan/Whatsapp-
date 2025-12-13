const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

let client;
let status = "idle"; // idle | qr | ready | disconnected
let qrCode = null;

const initWhatsApp = async () => {
  if (client) return;

  status = "starting";

  client = new Client({
    authStrategy: new LocalAuth({ clientId: "main" }),
    puppeteer: {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process"
      ]
    }
  });

  client.on("qr", async (qr) => {
    qrCode = await QRCode.toDataURL(qr);
    status = "qr";
    console.log("QR GENERATED");
  });

  client.on("ready", () => {
    status = "ready";
    qrCode = null;
    console.log("WHATSAPP READY");
  });

  client.on("disconnected", () => {
    status = "disconnected";
    client = null;
    qrCode = null;
    console.log("WHATSAPP DISCONNECTED");
  });

  client.initialize();
};

const getStatus = () => ({ status, qrCode });

const sendBulkMessage = async (number, message, qty) => {
  if (status !== "ready") {
    throw new Error("WhatsApp not connected");
  }

  const chatId = number + "@c.us";

  for (let i = 0; i < qty; i++) {
    await client.sendMessage(chatId, message);
    await new Promise(r => setTimeout(r, 1500));
  }
};

module.exports = {
  initWhatsApp,
  getStatus,
  sendBulkMessage
};
