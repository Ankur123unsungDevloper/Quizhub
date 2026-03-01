import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { SlUser } from "react-icons/sl";

const ActionButton = () => {
  const {isAuthenticated, isLoading} = useConvexAuth();

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
          <SlUser className="h-8 w-8 text-[#FF8D28]" />
        )}
    </div>
  );
};

export default ActionButton;