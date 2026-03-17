"use client";

import { useSearchParams } from "next/navigation";

/**
 * Read the active topbar filter from the URL.
 * Returns empty string when no filter is active (show all).
 *
 * Usage:
 *   const filter = useTopbarFilter();
 *   const filtered = cards.filter(c => !filter || c.category === filter);
 */
export const useTopbarFilter = (): string => {
  const searchParams = useSearchParams();
  return searchParams.get("filter") ?? "";
};