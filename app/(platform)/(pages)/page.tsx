/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Pagenation } from "@/components/pagination";
import Homepage from "../../(home-page)/_components/page";
import Quizzes from "../../quizzes/page";
import {
  usePathname,
  useSearchParams
} from "next/navigation";

const MainPage = () => {
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


  return (
    <div className="flex flex-col items-center justify-center w-full h-full">

      {/* Dynamic Content Area */}
      <div className="w-full h-full flex items-center justify-center">
        {isHome && <Homepage />}
        {isQuizzes && <Quizzes />}
      </div>

      {/* Pagination */}
      <Pagenation />
    </div>
  );
};

export default MainPage;