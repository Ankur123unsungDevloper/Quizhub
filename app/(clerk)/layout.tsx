import { Logo } from "@/components/logo";

const ClerkLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left - Form Side */}
      <div className="h-full lg:flex flex-col items-center justify-center px-4 bg-zinc-950">
        <div className="text-center space-y-4 pt-16">
          <h1 className="font-bold text-4xl text-[#FF8D28]">
            Welcome Back!
          </h1>
          <p className="text-base text-zinc-400">
            Log in to get back to your dashboard!
          </p>
        </div>
        {children}
      </div>

      {/* Right - Branding Side */}
      <div className="h-full bg-zinc-900 hidden lg:flex flex-col items-center justify-center gap-6">
        <Logo />
        <p className="text-zinc-400 text-sm tracking-widest uppercase">
          Test your knowledge
        </p>
        {/* Decorative orange line */}
        <div className="w-16 h-1 bg-[#FF8D28] rounded-full" />
      </div>
    </div>
  );
};

export default ClerkLayout;