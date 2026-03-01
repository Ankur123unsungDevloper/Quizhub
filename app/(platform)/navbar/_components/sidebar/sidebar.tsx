import { HiMenuAlt2 } from "react-icons/hi";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Sidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <HiMenuAlt2 className="text-4xl text-[#FF8D28]" />
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Are you absolutely sure?</SheetTitle>
          <SheetDescription>This action cannot be undone.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;