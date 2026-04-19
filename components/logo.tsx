import Image from "next/image";

export const Logo = () => {
  return (
    <div className="flex items-center gap-x-2 hover:cursor-pointer">
      {/* Mobile: image logo */}
      <div className="flex md:hidden">
        <Image
          src="/logo.svg"
          alt="QuizHub"
          width={36}
          height={36}
          className="rounded-lg"
        />
      </div>
      {/* Desktop: text logo */}
      <div className="hidden md:flex font-bold text-4xl text-white">
        Quiz<span className="bg-[#FF8D28] text-black px-2 rounded-lg ml-0.5">hub</span>
      </div>
    </div>
  );
};