"use client";

import * as z from "zod";
import Heading from "@/components/Heading";
import { MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { formSchema } from "./Constants";

import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";

import OpenAI from "openai";
import Groq from "groq-sdk";

type FormSchemaType = z.infer<typeof formSchema>;

const ConversationPage = () => {
  const router = useRouter();

  // Replace useState with useMessages hook
  const [messages, setMessages] = useState<
    OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  >([]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: FormSchemaType) => {
    try {
      const userMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
        role: "user",
        content: values.prompt,
      };

      // Add user message to messages array
      setMessages((messages) => [...messages, userMessage]);

      // Send request to server
      const response = await axios.post("/api/conversation", {
        messages: [...messages, userMessage], // Send all messages including user message
      });

      // Update messages array with only the new response
      setMessages((messages) => [...messages, response.data]);

      form.reset();
    } catch (error: any) {
      //TODO: Open Modal
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Conversation"
        description="Get a taste of this, bro!"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="Write a prompt: e.g. 'Why do I love food so much'"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full"
                disabled={isLoading}
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          <div className="flex float-col-reverse gap-y-4">
            <div className="flex float-col-reverse gap-y-4">
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col-reverse gap-y-2">
                  {Array.isArray(message.content) ? (
                    message.content.map((part, partIndex) => (
                      <React.Fragment key={partIndex}>
                        {part.type === "text" && (
                          <p className="text-sm">{part.text}</p>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;