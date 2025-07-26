const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Attach chat routes
app.use("/api", chatRoutes);

// Keep server boot logic
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
