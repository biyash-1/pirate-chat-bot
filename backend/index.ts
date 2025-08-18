import { APIGatewayEvent } from "aws-lambda";
import OpenAI from "openai";

export async function main(event: APIGatewayEvent) {
  const openai = new OpenAI({ apiKey: process.env["OPENAI_KEY"] });

  try {
    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const messages = body.messages || [];

    console.log("Received messages:", messages);

    // System prompt (pirate mode 🏴‍☠️)
    const systemPrompt: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: "system",
      content: "You are a helpful assistant who talks like a pirate",
    };

    // Call OpenAI
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // adjust if needed
      messages: [systemPrompt, ...messages],
    });

    // Extract AI reply
    const aiMessage = gptResponse.choices[0].message.content;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ reply: aiMessage }),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong" }),
    };
  }
}
