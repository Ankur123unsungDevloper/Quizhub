import { GoHome } from "react-icons/go";
import { BsCollection } from "react-icons/bs";
import { PiExam } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";
import { RiVipCrownLine } from "react-icons/ri";

export const navItems = [
  {
    label: "Home",
    href: "/",
    icon: GoHome,
  },
  {
    label: "Quizzes",
    href: "/quizzes",
    icon: BsCollection,
  },
  {
    label: "Exams",
    href: "/exams",
    icon: PiExam,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: IoSettingsOutline,
  },
  {
    label: "Subscription",
    href: "/subscription",
    icon: RiVipCrownLine,
    highlight: true,
  },
];