import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { SearchIcon } from "lucide-react";

const Topbar = () => {
  return (
    <div className="relative w-full pt-40">
      <div className="flex items-start justify-start w-full">
          <InputGroup className="max-w-sm w-full border-[#FF8D28] border-4">
            <InputGroupInput placeholder="Search categories..." />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>
    </div>
  );
};

export default Topbar;