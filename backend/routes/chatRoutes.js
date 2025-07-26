const express = require("express");
const { handleChat, getSessionMessages } = require("../controllers/chatController");

const router = express.Router();

router.post("/chat", handleChat);            // POST /api/chat
router.get("/chat/:sessionId", getSessionMessages);  // GET /api/chat/:sessionId

module.exports = router;
