import { auth } from "@clerk/nextjs/server";
import Configuation, { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { z } from "zod";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const generateSystemPrompt = (): ChatCompletionMessageParam => {
  const content = `You are a chat bot and will interact with a user. Be cordial and reply their messages using markdown syntax if needed. If markdown is a code block, specify the programming language accordingly.`;

  return { role: "system", content };
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const bodySchema = z.object({
      prompt: z.string(),
    });
    const { messages } = body;

    const { prompt } = bodySchema.parse(body);

    const systemPrompt = generateSystemPrompt();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!openai.apiKey) {
      return new NextResponse("Groq Key not configured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      temperature: 0.5,
      messages: [systemPrompt, { role: "user", content: prompt }],
      stream: true,
    });

    const stream = OpenAIStream(response);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log("error", error);
    return new NextResponse(JSON.stringify({ error }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
