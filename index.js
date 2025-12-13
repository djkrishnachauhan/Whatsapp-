
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { initWhatsApp, sendBulkMessage } = require("./whatsapp");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/start-whatsapp", (req, res) => {
  initWhatsApp(io);
  res.json({ success: true });
});

app.post("/send-message", async (req, res) => {
  const { number, message, quantity } = req.body;
  try {
    await sendBulkMessage(number, message, quantity);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
