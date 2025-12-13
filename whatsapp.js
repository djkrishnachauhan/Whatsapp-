const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

let client;
let isReady = false;
let ioInstance;

const initWhatsApp = (io) => {
  if (client) return;
  ioInstance = io;

  console.log("🚀 Initializing WhatsApp...");

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    }
  });

  client.on("qr", async (qr) => {
    console.log("📸 QR GENERATED");
    const img = await QRCode.toDataURL(qr);
    ioInstance.emit("qr", img);
  });

  client.on("authenticated", () => {
    console.log("🔐 AUTHENTICATED");
    ioInstance.emit("status", "Authenticated, loading chats...");
  });

  client.on("ready", () => {
    console.log("✅ WHATSAPP READY");
    isReady = true;
    ioInstance.emit("ready");
  });

  client.on("disconnected", (reason) => {
    console.log("❌ DISCONNECTED:", reason);
    client = null;
    isReady = false;
    ioInstance.emit("logout");
  });

  client.initialize();
};

const sendBulkMessage = async (number, message, qty) => {
  if (!client || !isReady) {
    throw new Error("WhatsApp not ready");
  }

  const chatId = number + "@c.us";

  for (let i = 0; i < qty; i++) {
    await client.sendMessage(chatId, message);
    await new Promise(r => setTimeout(r, 1500));
  }
};

module.exports = { initWhatsApp, sendBulkMessage };
