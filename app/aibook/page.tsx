"use client";

import { useState, useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { AIBookSidebar } from "./_components/aibook-sidebar";
import { AIBookTopbar } from "./_components/aibook-topbar";
import { AIBookHome } from "./_components/aibook-home";
import { AIBookChat } from "./_components/aibook-chat";
import { Book, Message } from "./_components/aibook-types";

export default function AIBookPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const currentBook = books.find((b) => b.id === activeBook);

  // ── Persist books to localStorage ───────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("aibook-books");
    if (saved) {
      try { setBooks(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (books.length > 0) localStorage.setItem("aibook-books", JSON.stringify(books));
  }, [books]);

  // ── Persist messages per book ────────────────────────────────────────────────
  useEffect(() => {
    if (!activeBook) return;
    const saved = localStorage.getItem(`aibook-messages-${activeBook}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restore Date objects
        setMessages(parsed.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch {}
    }
  }, [activeBook]);

  useEffect(() => {
    if (!activeBook || messages.length === 0) return;
    localStorage.setItem(`aibook-messages-${activeBook}`, JSON.stringify(messages));
  }, [messages, activeBook]);

  const switchBook = (id: string) => {
    const book = books.find((b) => b.id === id);
    if (!book || book.status !== "ready") return;
    setActiveBook(id);
    setHistory([]);
    // Messages will be loaded from localStorage via the useEffect above
    setMessages([]);
  };

  const handleUpload = (newBook: Book) => {
    setBooks((prev) => [...prev, newBook]);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 15) + 5;
      if (p >= 100) {
        clearInterval(interval);
        setBooks((prev) => prev.map((b) => b.id === newBook.id
          ? { ...b, status: "ready", progress: 100, pages: Math.floor(Math.random() * 300) + 100 }
          : b
        ));
      } else {
        setBooks((prev) => prev.map((b) => b.id === newBook.id ? { ...b, progress: p } : b));
      }
    }, 600);
  };

  const sendMessage = async (text?: string) => {
    const userText = text ?? input.trim();
    if (!userText || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const newHistory = [...history, { role: "user" as const, content: userText }];

    try {
      const response = await fetch("/api/aibook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          bookId: activeBook,            // ← must be here
          bookTitle: currentBook?.title, // ← must be here
        }),
      });

      const data = await response.json();
      const assistantText = data.content?.[0]?.text ?? "Sorry, something went wrong.";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setHistory([...newHistory, { role: "assistant", content: assistantText }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ Something went wrong. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setHistory([]);
    setMessages([]);
    if (activeBook) localStorage.removeItem(`aibook-messages-${activeBook}`);
  };

  return (
    <div className="flex flex-row w-full">
      <AIBookSidebar
        books={books}
        activeBook={activeBook}
        onSelectBook={switchBook}
        onGoHome={() => setActiveBook(null)} 
        onQuickAction={sendMessage}
      />
      <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AIBookTopbar
          currentBook={currentBook}
          onAction={sendMessage}
          onClearChat={clearChat}
        />
        {!activeBook ? (
          <AIBookHome
            books={books}
            onSelectBook={switchBook}
            onUpload={handleUpload}
            onSend={sendMessage}
          />
        ) : (
          <AIBookChat
            messages={messages}
            input={input}
            isLoading={isLoading}
            currentBook={currentBook}
            onInputChange={setInput}
            onSend={sendMessage}
          />
        )}
      </SidebarInset>
    </div>
  );
}