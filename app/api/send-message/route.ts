import { INSERT_MESSAGE } from "@/graphql/mutations/mutations";
import {
  GET_CHATBOT_BY_ID,
  GET_MESSAGES_BY_CHAT_SESSION_ID,
} from "@/graphql/queries/queries";
import serverClient from "@/lib/server/serverClient";
import {
  GetChatbotByIdResponse,
  MessagesByChatSessionIdResponse,
} from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure geminiApiKey is defined
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error(
    "GEMINI_API_KEY is not defined. Please set it in your environment variables."
  );
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

export async function POST(req: NextRequest) {
  const { chat_session_id, chatbot_id, content, name } = await req.json();
  console.log(
    `Received message from chat session ${chat_session_id}: ${content} (chatbot: ${chatbot_id})`
  );

  try {
    // Fetch chatbot details
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });
    const chatbot = data.chatbots;
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Fetch previous messages, but only include them if the session is not new
    const { data: messagesData } =
      await serverClient.query<MessagesByChatSessionIdResponse>({
        query: GET_MESSAGES_BY_CHAT_SESSION_ID,
        variables: { chat_session_id },
        fetchPolicy: "no-cache",
      });
    const previousMessages = messagesData.chat_sessions.messages;

    // Only include messages from the first user message in the session
    const userMessageIndex = previousMessages.findIndex(
      (message) => message.sender === "user"
    );

    // If no user message is found, start from the current message
    const formattedPreviousMessages =
      userMessageIndex >= 0
        ? previousMessages.slice(userMessageIndex).map((message) => ({
            role: message.sender === "ai" ? "model" : "user",
            parts: [{ text: message.content }],
          }))
        : [];

    // Prepare system instructions based on chatbot characteristics
    const systemInstructions = `You are a helpful assistant with expertise in the following topics: ${chatbot.chatbot_characteristics
      .map((c) => c.content)
      .join(
        ", "
      )}. When asked a question outside these areas, you should simply inform the user that the topic is outside your expertise without providing any additional information. Focus only on providing accurate and topic-specific responses related to your expertise. You may elaborate, but ensure accuracy with the provided information. You must stop and let the user know when you don't have further information to provide.`;

    // Combine the system instructions with the user's input
    const chatInput = `${systemInstructions}\n\nUser: ${content}`;

    // Prepare chat history starting with the user's message
    const chatHistory = [
      ...formattedPreviousMessages,
      {
        role: "user",
        parts: [{ text: chatInput }],
      },
    ];

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 8000,
        temperature: 0.7, // Adjusting for more creative and less generic responses
      },
    });

    // Send the chat history to the Gemini API
    const chat = model.startChat({
      history: chatHistory,
    });

    // Get the AI response
    const result = await chat.sendMessage(content);
    const aiResponse = result.response.text().trim();

    if (!aiResponse) {
      return NextResponse.json(
        { error: "Failed to generate AI response" },
        { status: 500 }
      );
    }

    // Insert user message
    const userMessageResult = await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        content,
        sender: "user",
        created_at: new Date().toISOString(),
      },
    });

    if (
      !userMessageResult ||
      !userMessageResult.data ||
      !userMessageResult.data.insertMessages
    ) {
      console.error("Failed to insert user message:", userMessageResult);
      return NextResponse.json(
        { error: "Failed to insert user message" },
        { status: 500 }
      );
    }

    // Insert AI response message
    const aiMessageResult = await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        content: aiResponse,
        sender: "ai",
        created_at: new Date().toISOString(),
      },
    });

    if (
      !aiMessageResult ||
      !aiMessageResult.data ||
      !aiMessageResult.data.insertMessages
    ) {
      console.error("Failed to insert AI message:", aiMessageResult);
      return NextResponse.json(
        { error: "Failed to insert AI message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: aiMessageResult.data.insertMessages.id,
      content: aiResponse,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
