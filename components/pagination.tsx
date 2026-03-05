"use client";

import {
  usePathname,
  useSearchParams
} from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


const TOTAL_PAGES = 1000;

export const Pagenation = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = searchParams.get("page");

  const isHome = pathname === "/";
  const isQuizzes = pathname.startsWith("/quizzes");

  let currentPage: number;

  if (isHome) {
    currentPage = 0;
  } else {
    currentPage =
      pageParam !== null && !isNaN(Number(pageParam))
        ? Number(pageParam)
        : 1;
  }

  // Always show 1–5 only
  const PAGE_GROUP_SIZE = 5;

  const currentBlock =
    currentPage === 0 ? 0 : Math.floor((currentPage - 1) / PAGE_GROUP_SIZE);

  const startPage = currentBlock * PAGE_GROUP_SIZE + 1;
  const endPage = Math.min(
    startPage + PAGE_GROUP_SIZE - 1,
    TOTAL_PAGES
  );

  const visiblePages =
    currentPage === 0
      ? [1, 2, 3, 4, 5]
      : Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
      );
  
  return (
    <Pagination>
        <PaginationContent className="flex items-center justify-center gap-6 text-[#FF8D28] text-xl mt-40 mb-10">

          {/* Previous */}
          <PaginationItem>
            <PaginationPrevious
              href={`/quizzes?page=${Math.max(1, currentPage - 1)}`}
              className={
                isHome || currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>

          {/* 1 2 3 4 5 */}
          {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={`/quizzes?page=${page}`}
              isActive={isQuizzes && currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              href={`/quizzes?page=${
                isHome ? 1 : Math.min(TOTAL_PAGES, currentPage + 1)
              }`}
              className={
                !isHome && currentPage >= TOTAL_PAGES
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>

        </PaginationContent>
      </Pagination>
  )
}