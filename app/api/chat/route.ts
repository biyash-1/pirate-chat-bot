// app/api/chat/route.ts
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { initialMessage } from "../../lib/data";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("No messages provided", { status: 400 });
    }

    const formattedMessages = [
      {
        role: initialMessage.role,
        content: String(initialMessage.content),
      },
      ...messages.map((m: any) => ({
        role: m.role || "user",
        content: String(m.content),
      })),
    ];

    console.log("Sending messages to API:", formattedMessages);

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages: formattedMessages,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.baseStream) {
            if (chunk?.type === "text-delta") {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("❌ Error in /api/chat:", err?.stack || err);
    return new Response("Error generating response", { status: 500 });
  }
}
