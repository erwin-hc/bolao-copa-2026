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
import { useEffect, useState } from "react";

const MessageDisplay: React.FC = () => {
  const { messages, removeMessage } = useMessages();
  const [navbarHeight, setNavbarHeight] = useState(80); // altura padrão

  useEffect(() => {
    // Função para obter a altura da navbar dinamicamente
    const updateNavbarHeight = () => {
      const navbar = document.querySelector(
        'header, .sticky, [class*="sticky"]',
      );
      if (navbar) {
        const height = navbar.getBoundingClientRect().height;
        setNavbarHeight(height);
      }
    };

    // Atualizar ao montar e ao redimensionar
    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);

    // Observer para mudanças na navbar (ex: expansão em mobile)
    const observer = new ResizeObserver(updateNavbarHeight);
    const navbar = document.querySelector('header, .sticky, [class*="sticky"]');
    if (navbar) observer.observe(navbar);

    return () => {
      window.removeEventListener("resize", updateNavbarHeight);
      observer.disconnect();
    };
  }, []);

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
        top: navbarHeight + 8, // Usa a altura dinâmica da navbar + 8px de margem
        right: 16,
        zIndex: 1000,
      }}
      className="max-w-[calc(100vw-32px)] sm:max-w-md"
    >
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            className={messageTypes.styles[message.type]}
            style={{
              padding: "12px 16px",
              marginBottom: 10,
              cursor: "pointer",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            onClick={() => removeMessage(message.id)}
            layout
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
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MessageDisplay;
