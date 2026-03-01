import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { FaSearch } from "react-icons/fa";

const SearchBar = () => {
  return (
    <InputGroup className="max-w-xl h-12 border-[#FF8D28] border-4">
      <InputGroupInput placeholder="Search..." className="text-2xl" />
      <InputGroupAddon>
        <FaSearch className="text-[#FF8D28] size-6" />
      </InputGroupAddon>
    </InputGroup>
  );
};

export default SearchBar;