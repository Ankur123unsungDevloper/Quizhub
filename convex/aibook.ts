import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Store extracted PDF pages ─────────────────────────────────────────────
export const storeBookPages = mutation({
  args: {
    bookId: v.string(),
    userId: v.string(),
    title: v.string(),
    pages: v.array(
      v.object({
        pageNumber: v.number(),
        text: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Delete existing pages for this book (in case of re-upload)
    const existing = await ctx.db
      .query("aibookPages")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();

    for (const page of existing) {
      await ctx.db.delete(page._id);
    }

    // Store new pages
    for (const page of args.pages) {
      await ctx.db.insert("aibookPages", {
        bookId: args.bookId,
        userId: args.userId,
        title: args.title,
        pageNumber: page.pageNumber,
        text: page.text,
      });
    }

    return { stored: args.pages.length };
  },
});

// ─── Get all pages for a book ──────────────────────────────────────────────
export const getBookPages = query({
  args: { bookId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aibookPages")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .order("asc")
      .collect();
  },
});

// ─── Search pages by keyword ───────────────────────────────────────────────
export const searchBookPages = query({
  args: {
    bookId: v.string(),
    keyword: v.string(),
  },
  handler: async (ctx, args) => {
    const pages = await ctx.db
      .query("aibookPages")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();

    const keyword = args.keyword.toLowerCase();

    // Find pages containing the keyword
    const matching = pages.filter((p) =>
      p.text.toLowerCase().includes(keyword)
    );

    // Return top 5 most relevant pages
    return matching.slice(0, 5).map((p) => ({
      pageNumber: p.pageNumber,
      text: p.text.slice(0, 1000), // limit text per page to keep context manageable
    }));
  },
});

// ─── Delete all pages for a book ──────────────────────────────────────────
export const deleteBookPages = mutation({
  args: { bookId: v.string() },
  handler: async (ctx, args) => {
    const pages = await ctx.db
      .query("aibookPages")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();

    for (const page of pages) {
      await ctx.db.delete(page._id);
    }

    return { deleted: pages.length };
  },
});