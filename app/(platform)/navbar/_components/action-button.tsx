"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlignJustify, X } from "lucide-react";

const ActionButton = () => {

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  // const closeDropdown = () => {
  //   setIsDropdownVisible(false);
  // };

  return (
    <div className="pr-2">
      <div className="items-center justify-center flex">
        <Button variant="ghost" size="lg" className="hidden lg:flex border-none text-lg">
          <Link href="/sign-in">
            Log in
          </Link>
        </Button>
      </div>
      
      {isDropdownVisible && (
        <div
          onClick={toggleDropdown}
          className="rounded-full xl:hidden"
        >
          <X className="h-6 w-6 items-center justify-center" />
        </div>
      )}
      {!isDropdownVisible && (
        <div
          onClick={toggleDropdown}
          className="flex lg:hidden"
        >
          <AlignJustify className="h-6 w-6 items-center justify-center mr-2" />
        </div>
      )}
      {/* {isDropdownVisible &&
        <DropdownMenu onClose={closeDropdown} />
      } */}
    </div>
  );
}

export default ActionButton;