
const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

let client;
let isReady = false;

const initWhatsApp = (io) => {
  if (client) return;

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
  });

  client.on("qr", async (qr) => {
    const img = await QRCode.toDataURL(qr);
    io.emit("qr", img);
  });

  client.on("ready", () => {
    isReady = true;
    io.emit("ready");
  });

  client.on("disconnected", () => {
    client = null;
    isReady = false;
    io.emit("logout");
  });

  client.initialize();
};

const sendBulkMessage = async (number, message, qty) => {
  if (!client || !isReady) throw new Error("WhatsApp not connected");

  const chatId = number + "@c.us";
  for (let i = 0; i < qty; i++) {
    await client.sendMessage(chatId, message);
    await new Promise(r => setTimeout(r, 1500));
  }
};

module.exports = { initWhatsApp, sendBulkMessage };
