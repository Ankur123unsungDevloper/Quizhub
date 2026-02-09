import { Logo } from "@/components/logo";

const ClerkLayout = ({
  children,
}: {
    children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="h-full lg:flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 pt-16">
          <h1 className="font-bold text-4xl text-[#FF8D28]">
            Welcome Back to our platform!
          </h1>
          <p className="text-base text-[#7E8CA0]">
            Log in to get back to your dashboard!
          </p>
        </div>
        {children}
      </div>
      <div className="h-full bg-gray-600 hidden lg:flex items-center justify-center">
        <Logo />
      </div>
    </div>
  );
}

export default ClerkLayout;