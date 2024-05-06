import { auth } from "@clerk/nextjs/server";
import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { body } = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!groq.apiKey) {
      return new NextResponse("Groq Key not configured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const response = await groq.chat.completions.create({
      messages,
      model: "mixtral-8x7b-32768",
    });

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("[CONVERSATION]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
