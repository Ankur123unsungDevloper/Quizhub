import { Separator } from "@/components/ui/separator";
import Community from "./_components/community";
import Company from "./_components/company";
import Legal from "./_components/legal";
import PlatformFooter from "./_components/platform";
import Resources from "./_components/resources";
import Social from "./_components/social";
import Update from "./_components/update";

const Footer = () => {
  return (
    <div className="flex items-center justify-center w-full h-full bg-zinc-800 p-10">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-row items-center justify-center gap-x-15">
          <PlatformFooter />
          <Resources />
          <Company />
          <Legal />
          <Community />
          <Social />
        </div>
        <div className="flex justify-start items-start w-full mt-15">
          <Update />
        </div>
        <Separator className="my-10 border-zinc-700 w-full" />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} QuizHub. All rights reserved.<br />
          Made with ❤️ for students.
        </p>
      </div>
    </div>
  );
};

export default Footer;