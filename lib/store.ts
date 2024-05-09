"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Creator = "USER" | "AI";

type Message = {
  id: string;
  text: string;
};

type MessageState = {
  messages: Message[];
  setMessages: (creator: Creator, message: string) => void;
  clearMessages: () => void;
};

const generateRandomId = () => Math.random().toString(36).substring(2, 9);

export const useMessages = create(
  persist<MessageState>(
    (set, get: any) => ({
      messages: get()?.messages || [],
      clearMessages: () => {
        return set({
          messages: [],
        });
      },
      setMessages: (creator: Creator, message: string) => {
        return set(() => {
          const storedMessages = get().messages;

          const lastMessage = storedMessages[storedMessages.length - 1];
          // if (!lastMessage) return storedMessages

          if (creator === "AI" && lastMessage.creator === "AI") {
            return {
              messages: [
                ...storedMessages.slice(0, -1),
                { ...lastMessage, text: message },
              ],
            };
          }

          return {
            messages: [
              ...storedMessages,
              {
                id: generateRandomId(),
                text: message,
              },
            ],
          };
        });
      },
    }),
    {
      name: "messages",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    }
  )
);
