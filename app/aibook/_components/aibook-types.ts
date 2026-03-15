export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type Book = {
  id: string;
  title: string;
  pages: number;
  status: "ready" | "indexing" | "uploading";
  progress?: number;
  emoji: string;
  chapter?: string;
};