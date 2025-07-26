const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

/**
 * POST /chat
 * Starts a new chat session OR continues an existing one
 * and adds a user message
 */
app.post("/chat", async (req, res) => {
  const { message, conversation_id, userId } = req.body;

  try {
    let session;

    if (conversation_id) {
      // Try to find existing session
      session = await prisma.chatSession.findUnique({
        where: { id: parseInt(conversation_id) },
      });
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
    } else {
      // Create new session
      session = await prisma.chatSession.create({
        data: {
          userId: userId, // Make sure this user exists
        },
      });
    }

    // Add user message
    const newMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "USER",
        content: message,
      },
    });

    // (Optional) You could now generate an AI reply here
    const aiReply = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "AI",
        content: "This is a mock AI reply!",
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      messages: [newMessage, aiReply],
    });
  } catch (err) {
    console.error("Error handling chat:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * GET /chat/:sessionId
 * Fetches all messages for a session
 */
app.get("/chat/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: parseInt(sessionId) },
      orderBy: { timestamp: "asc" },
    });

    return res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ error: "Could not fetch messages" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
