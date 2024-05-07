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

// Import the useMessages hook
import { useMessages } from "@/lib/store"

type FormSchemaType = z.infer<typeof formSchema>;

const ConversationPage = () => {
  const router = useRouter();
  
  // Replace useState with useMessages hook
  const { messages, setMessages, clearMessages } = useMessages();
  
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: FormSchemaType) => {
    try {
      const userMessage = values.prompt;

      // Use setMessages from useMessages hook to add a new message
      setMessages("USER", userMessage);

      const response = await axios.post("/api/conversation", {
        messages: messages,
      });

      // No need to set messages here, it's already done in useMessages hook
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
            {/* Display messages */}
            {messages.map((message) => (
              <div key={message.id}>{message.text}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;