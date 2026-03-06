"use client"

import * as React from "react"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import { usePathname } from "next/navigation";

export function Menu() {
  const pathname = usePathname();

  const isActiveRoute = (route: string) =>
    pathname === route || pathname.startsWith(route + "/")

  const isHome = pathname === "/";
  const isQuizzes = isActiveRoute("/quizzes");
  const isCategories = isActiveRoute("/categories");
  const isAIBook = isActiveRoute("/aibook")
  
  const activeStyle = "text-[#FF8D28] border-b-4 border-[#FF8D28]"

  return (
    <NavigationMenu>
      <NavigationMenuList className="flex mt-6">
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle({
            className: `
              text-sm font-medium hover:text-[#FF8D28] w-53 h-10 bg-zinc-800/50
              ${isHome ? activeStyle : ""}
            `,
          })}
          >
            <Link
              href="/"
              className="text-sm font-medium"
            >
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger
            className={`
              text-sm w-53 h-10 hover:text-[#FF8D28] bg-zinc-800/50
              ${isQuizzes ? activeStyle : ""}
            `}
          >
            <Link
              href="/quizzes"
              className="text-sm font-medium"
            >
              Quizzes
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="min-w-7xl flex justify-center">
            <div className="grid grid-cols-3 w-full">

              {/* LEFT */}
              <div className="flex flex-col border-r p-6 items-start justify-start w-50">
                <Link href="/quizzes/daily">Daily Quiz</Link>
                <Link href="/quizzes/weekly">Weekly Challenge</Link>
                <Link href="/quizzes/mock">Mock Tests</Link>
                <Link href="/quizzes/popular">Popular Quizzes</Link>
                <Link href="/quizzes/new">New Quizzes</Link>
              </div>

              {/* CENTER */}
              <div className="grid grid-cols-2 gap-4 p-6 items-center justify-center w-full">
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
              </div>

              {/* RIGHT */}
              <div className="border-l p-6 items-end justify-end w-full">
                <p className="text-sm text-muted-foreground">Featured Quiz</p>
                <div className="mt-4 rounded-lg bg-zinc-800 p-4">
                  Weekly Coding Quiz
                </div>
              </div>

            </div>            
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger
            className={`
              text-sm w-53 h-10 hover:text-[#FF8D28] bg-zinc-800/50
              ${isCategories ? activeStyle : ""}
            `}
          >
            <Link
              href="/categories"
              className="text-sm font-medium"
            >
              Categories
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="min-w-7xl flex justify-center">
            <div className="grid grid-cols-3 w-full">

              <div className="flex flex-col gap-3 border-r p-6 items-start justify-start w-50">
                <Link href="/categories/programming">Programming</Link>
                <Link href="/categories/ai">Artificial Intelligence</Link>
                <Link href="/categories/data-science">Data Science</Link>
                <Link href="/categories/web-dev">Web Development</Link>
                <Link href="/categories/cybersecurity">Cyber Security</Link>
              </div>

              <div className="grid grid-cols-2 gap-4 p-6 items-center justify-center w-full">
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
              </div>

              <div className="border-l p-6 items-end justify-end w-full">
                <p className="text-sm text-muted-foreground">Top Category</p>
                <div className="mt-4 rounded-lg bg-zinc-800 p-4">
                  Master Web Development
                </div>
              </div>

            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger className="text-sm w-53 h-10 hover:text-[#FF8D28] bg-zinc-800/50">Classes Videos</NavigationMenuTrigger>
          <NavigationMenuContent className="min-w-7xl flex justify-center">
            <div className="grid grid-cols-3 w-full">

              <div className="flex flex-col gap-3 border-r p-6 items-start justify-start w-50">
                <Link href="/videos/javascript">JavaScript</Link>
                <Link href="/videos/react">React</Link>
                <Link href="/videos/nextjs">Next.js</Link>
                <Link href="/videos/python">Python</Link>
                <Link href="/videos/dsa">DSA</Link>
              </div>

              <div className="grid grid-cols-2 gap-4 p-6 items-center justify-center w-full">
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
              </div>

              <div className="border-l p-6 items-end justify-end w-full">
                <p className="text-sm text-muted-foreground">Trending Course</p>
                <div className="mt-4 rounded-lg bg-zinc-800 p-4">
                  Full Stack Development
                </div>
              </div>

            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle({
            className: `
                text-sm font-medium hover:text-[#FF8D28] w-53 h-10 bg-zinc-800/50
                ${isAIBook ? activeStyle : ""}
              `,
            })}
          >
            <Link
              href="/aibook"
              className="text-sm font-medium"
            >
              AIBook
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger className="text-sm w-53 h-10 hover:text-[#FF8D28] bg-zinc-800/50">Community</NavigationMenuTrigger>
          <NavigationMenuContent className="min-w-7xl flex justify-center">
            <div className="grid grid-cols-3 w-full">

              <div className="flex flex-col gap-3 border-r p-6 items-start justify-start w-50">
                <Link href="/community/discussions">Discussions</Link>
                <Link href="/community/questions">Questions</Link>
                <Link href="/community/leaderboard">Leaderboard</Link>
                <Link href="/community/events">Events</Link>
                <Link href="/community/groups">Study Groups</Link>
              </div>

              <div className="grid grid-cols-2 gap-4 p-6 items-center justify-center w-full">
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
                <div className="h-24 rounded-lg bg-zinc-200"></div>
              </div>

              <div className="border-l p-6 items-end justify-end w-full">
                <p className="text-sm text-muted-foreground">Community Highlight</p>
                <div className="mt-4 rounded-lg bg-zinc-800 p-4">
                  Join Weekly Coding Battles
                </div>
              </div>

            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
