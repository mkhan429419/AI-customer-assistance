import {
  GET_CHATBOT_BY_ID,
  GET_MESSAGES_BY_CHAT_SESSION_ID,
} from "@/graphql/queries/queries";
import serverClient from "@/lib/server/serverClient";
import {
  GetChatbotByIdResponse,
  MessagesByChatSessionIdResponse,
} from "@/types/types";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

const gemini = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  const { chat_session_id, chatbot_id, content, name } = await req.json();
  console.log(
    `Received message from chat session ${chat_session_id}: ${content} (chatbot: ${chatbot_id})`
  );
  try {
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });
    const chatbot = data.chatbots;
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }
    const { data: messagesData } =
      await serverClient.query<MessagesByChatSessionIdResponse>({
        query: GET_MESSAGES_BY_CHAT_SESSION_ID,
        variables: { chat_session_id },
        fetchPolicy: "no-cache",
      });
    const previousMessages = messagesData.chat_sessions.messages;
    const formattedPreviousMessages: ChatCompletionMessageParam[] =
      previousMessages.map((message) => ({
        role: message.sender === "ai" ? "system" : "user",
        name: message.sender === "ai" ? "system" : name,
        content: message.content,
      }));
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
