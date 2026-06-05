// components/MessageDisplay.tsx
"use client";
import { useMessages } from "@/providers/message-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
} from "lucide-react";

const MessageDisplay: React.FC = () => {
  const { messages, removeMessage } = useMessages();

  const messageTypes = {
    icons: {
      success: <CircleCheckIcon className="size-4" />,
      error: <OctagonXIcon className="size-4" />,
      info: <InfoIcon className="size-4" />,
      warning: <TriangleAlertIcon className="size-4" />,
    },
    styles: {
      success: `border-smui-dark-surface-3
                bg-smui-green
                text-slate-950
                border-2 
                border-l-10 `,
      error: `border-smui-dark-surface-3
              bg-smui-red
              text-slate-950
              border-2 
              border-l-10 
              `,
      info: `border-smui-dark-surface-3 
             bg-smui-frost-1 
             text-slate-950
             border-2 
             border-l-10 
              `,
      warning: `border-smui-dark-surface-3
                bg-smui-yellow 
                text-slate-950
                border-2
                border-l-10 
                `,
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 100,
        right: 20,
        zIndex: 1000,
        paddingLeft: "18px",
      }}
    >
      <AnimatePresence>
        {messages.map((message) => {
          return (
            <motion.div
              key={message.id}
              // Apply basic styles based on message type
              className={messageTypes.styles[message.type]}
              style={{
                padding: "10px 20px",
                marginBottom: 10,
                cursor: "pointer",
                borderRadius: "4px",
              }}
              onClick={() => removeMessage(message.id)}
              layout // Faz com que os outros itens deslizem suavemente quando um é removido
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x: 20,
                scale: 0.95,
                transition: { duration: 0.2 },
              }}
            >
              <div className="flex items-center gap-3">
                <span>{messageTypes.icons[message.type]}</span>
                <span className="">{message.text}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default MessageDisplay;
