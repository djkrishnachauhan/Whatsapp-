const express = require("express");
const path = require("path");
const {
  initWhatsApp,
  getStatus,
  sendBulkMessage
} = require("./whatsapp");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

app.get("/start-whatsapp", async (_, res) => {
  await initWhatsApp();
  res.json({ success: true });
});

app.get("/status", (_, res) => {
  res.json(getStatus());
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

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
