"use client";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useConvexAuth } from "convex/react";

import { SlUser } from "react-icons/sl";
import { TbLogout } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { IoSettings } from "react-icons/io5";
const ActionButton = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  return (
    <div>
      {!isAuthenticated && !isLoading && (
        <Button className="bg-[#FF8D28] text-white hover:bg-[#FF8D28]/90 w-30 text-xl">
          <Link href="/sign-in">
            Login
          </Link>
        </Button>
      )}
        {isAuthenticated && !isLoading && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SlUser
                className="h-8 w-8 text-[#FF8D28] cursor-pointer"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-50">
              <DropdownMenuGroup>
              <DropdownMenuItem className="flex flex-row" onClick={() => router.push("/profile")}>
                <CgProfile className="h-8 w-8 mr-2" />
                  Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TbLogout className="h-8 w-8 mr-2" />
                subscription
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IoSettings className="h-8 w-8 mr-2" />
                Setting
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TbLogout className="h-8 w-8 mr-2" />
                LogOut
              </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
    </div>
  );
};

export default ActionButton;