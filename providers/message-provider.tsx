"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface Message {
  id: number;
  type: "success" | "error" | "info" | "warning";
  text: string;
}

interface MessageContextType {
  messages: Message[];
  addMessage: (type: Message["type"], text: string) => void;
  removeMessage: (id: number) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const removeMessage = useCallback((id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const addMessage = useCallback(
    (type: Message["type"], text: string) => {
      const id = Date.now();
      const newMessage: Message = { id, type, text };
      setMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        removeMessage(id);
      }, 5000);
    },
    [removeMessage],
  );

  const contextValue = {
    messages,
    addMessage,
    removeMessage,
  };

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};
