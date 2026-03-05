"use client";

import { Pagenation } from "@/components/pagination";
import Footer from "../(platform)/footer/footer";
import Navbar from "../(platform)/navbar/navbar";

const Quizzespage = () => {
  return (
    <div>
      <Navbar />
      <Pagenation />
      <Footer />
    </div>
  );
};

export default Quizzespage;