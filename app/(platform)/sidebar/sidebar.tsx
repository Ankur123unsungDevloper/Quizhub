import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const Sidebar = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <SheetHeader>
        <SheetTitle>Are you absolutely sure?</SheetTitle>
        <SheetDescription>This action cannot be undone.</SheetDescription>
      </SheetHeader>
    </div>
  );
};

export default Sidebar;