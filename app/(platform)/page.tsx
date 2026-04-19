import MainPage from "./(pages)/page";
import Footer from "./footer/footer";
import Navbar from "./navbar/navbar";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-zinc-950">
      <Navbar />
      <div className="w-full px-4 md:px-6 md:max-w-full">
        <MainPage />
      </div>
      <Footer />
    </div>
  );
}