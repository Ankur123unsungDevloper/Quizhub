import LandingPage from "./(landing-page)/page";
import Navbar from "./navbar/navbar";

export default function Home() {
  return (
    <div className="min-h-full">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 py-10">
        <Navbar />
        <LandingPage />
      </div>
    </div>
  );
}
