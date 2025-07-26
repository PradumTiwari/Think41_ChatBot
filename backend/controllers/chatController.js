const { PrismaClient } = require("@prisma/client");
const { askGroq } = require("../services/llmService");

const prisma = new PrismaClient();

async function handleChat(req, res) {
  const { userId, message, conversation_id } = req.body;

  try {
    let session;

    if (conversation_id) {
      session = await prisma.chatSession.findUnique({
        where: { id: parseInt(conversation_id) },
      });

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
    } else {
      session = await prisma.chatSession.create({
        data: { userId },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "USER",
        content: message,
      },
    });

    // Get context messages for AI
    const previousMessages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { timestamp: "asc" },
    });

    const context = previousMessages.map((msg) => ({
      role: msg.sender.toLowerCase(), // "user" or "ai"
      content: msg.content,
    }));

    // Ask Groq
    const aiReply = await askGroq(context);

    // Save AI reply
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "AI",
        content: aiReply,
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      reply: aiReply,
    });
  } catch (err) {
    console.error("Error in handleChat:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

async function getSessionMessages(req, res) {
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
}

module.exports = { handleChat, getSessionMessages };
