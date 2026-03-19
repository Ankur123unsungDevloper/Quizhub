"use client";

import { useState, useRef, useEffect } from "react";
import { FaBrain, FaPaperPlane } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

type Message = { role: "user" | "assistant"; text: string };

type Props = {
  topicName?: string;
  subject?: string;
};

export const AIDoubtSolver = ({ topicName = "this topic", subject = "Science" }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hi! I'm your AI tutor for **${topicName}**. Ask me anything — concepts, formulas, solved examples, or exam tips. I'll explain in the simplest way possible! 🎯`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are an expert ${subject} tutor specializing in ${topicName} for Indian competitive exams (JEE, NEET, UPSC, Boards). 
          Explain concepts clearly, use simple language, give examples, and relate to exam patterns.
          Format answers with clear structure. Use bullet points for lists. Keep answers focused and helpful.
          Never refuse to help with academic questions.`,
          messages: [
            ...messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0).map(m => ({
              role: m.role,
              content: m.text,
            })),
            { role: "user", content: q },
          ],
        }),
      });

      const data = await res.json() as { content: Array<{ type: string; text: string }> };
      const reply = data.content.find(c => c.type === "text")?.text ?? "Sorry, I couldn't process that. Try again!";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    `Explain ${topicName} in simple terms`,
    "What are the important formulas?",
    "Give me a solved example",
    "What are common exam questions?",
  ];

  return (
    <div className="bg-zinc-950 border border-yellow-500/20 rounded-2xl overflow-hidden flex flex-col h-120">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800 shrink-0">
        <FaBrain className="size-4 text-yellow-400" />
        <span className="text-white font-semibold text-sm">AI Doubt Solver</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold">ELITE</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs">AI Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center mr-2 shrink-0 mt-1">
                <HiSparkles className="size-3.5 text-yellow-400" />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-[#FF8D28] text-black font-medium rounded-br-sm"
                : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center mr-2 shrink-0">
              <HiSparkles className="size-3.5 text-yellow-400" />
            </div>
            <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#FF8D28]/50 transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex gap-2 bg-zinc-800 rounded-xl border border-zinc-700 focus-within:border-[#FF8D28]/50 p-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask your doubt..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-zinc-500 outline-none px-2"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg bg-[#FF8D28] flex items-center justify-center hover:bg-[#ff8d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <FaPaperPlane className="size-3 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};