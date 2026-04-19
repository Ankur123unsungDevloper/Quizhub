import MainPage from "./(pages)/page";
import Footer from "./footer/footer";
import Navbar from "./navbar/navbar";

export default function Home() {
  return (
    <div className="min-h-full">
      <div className="flex flex-col items-center justify-center text-center gap-y-8 flex-1 px-2 pt-10">
        <Navbar />
        <MainPage />
        <Footer />
      </div>
    </div>
  );
};
