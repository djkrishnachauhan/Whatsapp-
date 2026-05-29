const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

let client;
let status = "idle";
let qrCode = null;

const initWhatsApp = async () => {
  if (client && status === "ready") return;

  // Destroy existing broken client if any
  if (client) {
    try { await client.destroy(); } catch (_) {}
    client = null;
  }

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

  await client.initialize();  // ← await added
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

module.exports = { initWhatsApp, getStatus, sendBulkMessage };
