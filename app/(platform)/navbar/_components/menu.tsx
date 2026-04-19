"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button";

import { FaChevronRight } from "react-icons/fa";
import { HiLightBulb } from "react-icons/hi";
import { GiNetworkBars } from "react-icons/gi";
import {
  MdPlaylistPlay,
  MdThumbUp
} from "react-icons/md";
import { GrChannel } from "react-icons/gr";
import { LiaRandomSolid } from "react-icons/lia";

export function Menu() {
  const pathname = usePathname();

  const isActiveRoute = (route: string) =>
    pathname === route || pathname.startsWith(route + "/")

  const isHome = pathname === "/";
  const isQuizzes = isActiveRoute("/quizzes");
  const isCategories = isActiveRoute("/categories");
  const isAIBook = isActiveRoute("/aibook");
  const isVideos = isActiveRoute("/classes-video");
  const isCommunity = isActiveRoute("/community");

  const activeStyle = "text-[#FF8D28] border-b-4 border-[#FF8D28]"

  const filters = [
    "General Knowledge",
    "Current Affairs",
    "Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Computer Science",
    "English",
    "Logical Reasoning",
    "Aptitude",
    "Programming",
    "Data Structures",
    "Web Development",
    "Artificial Intelligence",
    "Machine Learning",
  ];

  const popularItems = [
    "General Knowledge",
    "Current Affairs",
    "Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Computer Science",
    "English Grammar",
    "Logical Reasoning",
    "Aptitude",
    "Programming",
    "Data Structures",
    "Web Development",
    "Artificial Intelligence",
    "Machine Learning",
  ];

  return (
  <NavigationMenu className="w-full max-w-full">
    <NavigationMenuList className="flex mt-2 w-full overflow-x-auto scrollbar-hide px-2 gap-1">
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
            <div className="flex flex-row w-full">

              {/* LEFT */}
              <div className="flex flex-col border-r p-2 items-start justify-start w-80">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Discover Quizzes</h3>
                </div>
                <div className="flex flex-col items-center justify-center w-full gap-4 mt-6">
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <Link href="/quizzes/daily">Daily Quiz</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <Link href="/quizzes/weekly">Weekly Challenge</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <Link href="/quizzes/mock">Mock Tests</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <Link href="/quizzes/popular">Popular Quizzes</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <Link href="/quizzes/new">New Quizzes</Link>
                  </Button>
                </div>
              </div>
              {/* CENTER */}
              <div className="flex flex-col items-center justify-center w-full">
                <div className="flex flex-row w-full">
                  <div className="flex flex-col w-full items-start justify-start p-2">
                    <div className="flex items-center justify-center gap-2 mb-4 hover:underline cursor-pointer">
                      <Link href="/quizzes/trending" className="text-2xl font-semibold text-white">Top Trending</Link>
                      <FaChevronRight className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-row w-full gap-2">
                      <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                    </div>
                  </div>
                  <div className="flex flex-col w-full items-start justify-start p-2">
                    <div className="flex items-center justify-center gap-2 mb-4 hover:underline cursor-pointer">
                      <Link href="/quizzes/popular" className="text-2xl font-semibold text-white">Most Popular</Link>
                      <FaChevronRight className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-row w-full gap-2">
                      <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                    </div>
                  </div>
                  <div className="flex flex-col w-full items-start justify-start p-2">
                    <div className="flex items-center justify-center gap-2 mb-4 hover:underline cursor-pointer">
                      <Link href="/quizzes/viewed" className="text-2xl font-semibold text-white">Most Viewed</Link>
                      <FaChevronRight className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-row w-full gap-2">
                      <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full items-center justify-center mt-8">
                  <div className="flex items-center justify-center">
                    <h3 className="text-2xl font-semibold text-white">Popular Filters</h3>
                  </div>
                  <div className="flex flex-wrap items-center justify-center w-full gap-4 mt-4">
                    {filters.map((filter, index) => (
                      <Button asChild
                        key={index}
                        className="shrink-0 bg-zinc-800 hover:bg-zinc-800/50 text-white"
                      >
                        <Link href={`/quizzes/filters/${filter.toLowerCase().replace(/\s+/g, "-")}`}>
                          {filter}
                        </Link>
                      </Button>
                    ))}
                  </div>
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
            <div className="flex flex-row w-full">

              <div className="flex flex-col gap-3 border-r p-2 items-start justify-start w-120">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Orientation</h3>
                </div>
                <div className="grid grid-cols-2 w-full gap-4">
                  <Button asChild className="shrink-0 bg-zinc-800 hover:bg-zinc-800/50 text-white">
                    <Link href="/categories">All</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-800 hover:bg-zinc-800/50 text-white">
                    <Link href="/categories/school">School</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-800 hover:bg-zinc-800/50 text-white">
                    <Link href="/categories/college">College</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-800 hover:bg-zinc-800/50 text-white">
                    <Link href="/categories/competition">Competition</Link>
                  </Button>
                </div>
                <div className="flex mt-10">
                  <h3 className="text-xl font-semibold text-white">Quiz in Your Language</h3>
                </div>
                <div className="grid grid-cols-2 w-full gap-4">
                  <Button asChild className="shrink-0 bg-zinc-800 hover:bg-zinc-800/50 text-white">
                    <Link href="/categories">Hindi</Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col w-full items-start justify-start gap-4 p-2">
  
                {/* Header */}
                <div className="flex items-center justify-center gap-2 mb-4 hover:underline cursor-pointer">
                  <Link href="/categories/popular" className="text-2xl font-semibold text-white">Most Popular</Link>
                  <FaChevronRight className="h-5 w-5 text-white" />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-6 gap-4 w-full">
                  {popularItems.map((category) => (
                    <div
                      key={category}
                      className="h-24 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"
                    >
                      <p className="text-white text-sm font-semibold">{category}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-l p-6 items-end justify-end w-100">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Popular Search</h3>
                </div>
                <div className="flex flex-col gap-4 mt-8">
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white">
                    <Link href="/categories/popular-search">DSA</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white">
                    <Link href="/categories/popular-search">Web Development</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white">
                    <Link href="/categories/popular-search">Web Development</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white">
                    <Link href="/categories/popular-search">Web Development</Link>
                  </Button>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger
            className={`
              text-sm w-53 h-10 hover:text-[#FF8D28] bg-zinc-800/50
              ${isVideos ? activeStyle : ""}
            `}
          >
            <Link
              href="/classes-video"
              className="text-sm font-medium"
            >
              Classes Videos
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="min-w-7xl flex justify-center">
            <div className="flex flex-row w-full">

              <div className="flex flex-col gap-3 border-r p-2 items-start justify-start w-110">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Discover Video</h3>
                </div>
                <div className="flex flex-col w-full items-center justify-center">
                  <Button className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <HiLightBulb className="size-6" />
                    <Link href="/">
                      Recommended
                    </Link>
                  </Button>
                  <Button className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <GiNetworkBars className="size-6" />
                    <Link href="/">
                      Most Viewed
                    </Link>
                  </Button>
                  <Button className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <MdThumbUp className="size-6" />
                    <Link href="/">
                      Top Rated
                    </Link>
                  </Button>
                  <Button className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <MdPlaylistPlay className="size-6" />
                    <Link href="/">
                      Playlist
                    </Link>
                  </Button>
                  <Button className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <GrChannel className="size-6" />
                    <Link href="/">
                      Channels
                    </Link>
                  </Button>
                  <Button className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <LiaRandomSolid className="size-6" />
                    <Link href="/">
                      Randoms
                    </Link>
                  </Button>
                  <Button className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <HiLightBulb className="size-6" />
                    <Link href="/">
                      Newest
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex flex-row w-full px-4">
                <div className="flex flex-col w-full items-start justify-start p-2">
                  <div className="flex items-center justify-center gap-2 mb-4 hover:underline cursor-pointer">
                    <Link href="/quizzes/trending" className="text-2xl font-semibold text-white">Newest</Link>
                    <FaChevronRight className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col w-full gap-2 gap-y-8">
                    <div className="flex flex-col items-start justify-start p-2">
                      <div className="h-25 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      <p className="text-white">Newest Quiz</p>
                    </div>
                    <div className="flex flex-col items-start justify-start p-2">
                      <div className="h-25 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      <p className="text-white">Newest Quiz</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full items-start justify-start p-2">
                  <div className="flex items-center justify-center gap-2 mb-4 hover:underline cursor-pointer">
                    <Link href="/quizzes/popular" className="text-2xl font-semibold text-white">Playlists</Link>
                    <FaChevronRight className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col w-full gap-2 gap-y-8">
                    <div className="flex flex-col items-start justify-start p-2">
                      <div className="h-25 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      <p className="text-white">Popular Quiz</p>
                    </div>
                    <div className="flex flex-col items-start justify-start p-2">
                      <div className="h-25 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      <p className="text-white">Popular Quiz</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full items-start justify-start p-2">
                  <div className="flex items-center justify-center gap-2 mb-4 hover:underline cursor-pointer">
                    <Link href="/quizzes/viewed" className="text-2xl font-semibold text-white">Channels</Link>
                    <FaChevronRight className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col w-full gap-2 gap-y-8">
                    <div className="flex flex-col items-start justify-start p-2">
                      <div className="h-25 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end">
                        <div className="flex flex-col h-full w-1/3 relative left-40 items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-tr-lg rounded-br-lg">
                          <p>stack</p>
                          <span className="flex flex-row items-center justify-center"><MdPlaylistPlay />9</span>
                        </div>
                      </div>
                      <p className="text-white">Newest Quiz</p>
                    </div>
                    <div className="flex flex-col items-start justify-start p-2">
                      <div className="h-25 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end">
                        <div className="flex flex-col h-full w-1/3 relative left-40 items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-tr-lg rounded-br-lg">
                          <p>stack</p>
                          <span className="flex flex-row items-center justify-center"><MdPlaylistPlay />4</span>
                        </div>
                      </div>
                      <p className="text-white">Newest Quiz</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-l p-6 items-end justify-end w-100">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Trending Search</h3>
                </div>
                <div className="flex flex-col gap-4 mt-8">
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white">
                    <Link href="/categories/popular-search">DSA</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white">
                    <Link href="/categories/popular-search">Web Development</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white">
                    <Link href="/categories/popular-search">Web Development</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white">
                    <Link href="/categories/popular-search">Web Development</Link>
                  </Button>
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
          <NavigationMenuTrigger
            className={`
              text-sm w-53 h-10 hover:text-[#FF8D28] bg-zinc-800/50
              ${isCommunity ? activeStyle : ""}
            `}
          >
            <Link
              href="/community"
              className="text-sm font-medium"
            >
              Community
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="min-w-7xl flex justify-center">
            <div className="flex flex-row w-full">

              <div className="flex flex-col border-r p-2 items-start justify-start w-80">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Discover Quizzes</h3>
                </div>
                <div className="flex flex-col items-center justify-center w-full gap-4 mt-6">
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <Link href="/quizzes/daily">Daily Quiz</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <Link href="/quizzes/weekly">Weekly Challenge</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <Link href="/quizzes/mock">Mock Tests</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <Link href="/quizzes/popular">Popular Quizzes</Link>
                  </Button>
                  <Button asChild className="shrink-0 bg-zinc-900 text-start justify-start hover:bg-zinc-700 text-white w-full">
                    <Link href="/quizzes/new">New Quizzes</Link>
                  </Button>
                </div>
              </div>
              {/* CENTER */}
              <div className="flex flex-col items-center justify-center w-full">
                <div className="flex flex-row w-full">
                  <div className="flex flex-col w-full items-start justify-start p-2">
                    <div className="flex items-center justify-center gap-2 mb-4 hover:underline cursor-pointer">
                      <Link href="/quizzes/trending" className="text-2xl font-semibold text-white">Top Trending</Link>
                      <FaChevronRight className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col w-full gap-y-6">
                      <div className="flex flex-row w-full gap-2">
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      </div>
                      <div className="flex flex-row w-full gap-2">
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col w-full items-start justify-start p-2">
                    <div className="flex items-center justify-center gap-2 mb-4 hover:underline cursor-pointer">
                      <Link href="/quizzes/popular" className="text-2xl font-semibold text-white">Most Popular</Link>
                      <FaChevronRight className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col w-full gap-y-6">
                      <div className="flex flex-row w-full gap-2">
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      </div>
                      <div className="flex flex-row w-full gap-2">
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col w-full items-start justify-start p-2">
                    <div className="flex items-center justify-center gap-2 mb-4 hover:underline cursor-pointer">
                      <Link href="/quizzes/viewed" className="text-2xl font-semibold text-white">Most Viewed</Link>
                      <FaChevronRight className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col w-full gap-y-6">
                      <div className="flex flex-row w-full gap-2">
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      </div>
                      <div className="flex flex-row w-full gap-2">
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                        <div className="h-40 w-full rounded-lg bg-zinc-700 hover:bg-zinc-600 transition flex items-end p-3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 items-end justify-end w-100">
                </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
