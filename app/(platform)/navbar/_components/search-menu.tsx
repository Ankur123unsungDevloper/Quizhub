import { Input } from "@/components/ui/input";
import { IoMdSearch } from "react-icons/io";

const SearchMenu = () => {
  return (
    <div className="flex-1 flex justify-center relative left-50">
      <div className="relative w-120 h-12">
        {/* Search Icon */}
        <IoMdSearch
          className="absolute left-1 top-6 -translate-y-1/2 text-orange-500 text-5xl"
        />

        {/* Input */}
        <Input
          placeholder="Search...."
          className="pl-14 text-6xl w-full h-full rounded-2xl border-3"
        />
      </div>
    </div>
  );
};

export default SearchMenu;
