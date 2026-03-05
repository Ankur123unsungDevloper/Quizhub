import Link from "next/link";

const PlatformFooter = () => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-4xl font-semibold text-muted-foreground">
        Platform
      </h3>

      <ul className="flex flex-col gap-2 text-sm text-start text-[#FF8D28]">
        <li>
          <Link href="/quizzes" className="hover:text-white transition">
            Quizzes
          </Link>
        </li>

        <li>
          <Link href="/categories" className="hover:text-white transition">
            Categories
          </Link>
        </li>

        <li>
          <Link href="/exams" className="hover:text-white transition">
            Exams
          </Link>
        </li>

        <li>
          <Link href="/practice" className="hover:text-white transition">
            Practice Questions
          </Link>
        </li>

        <li>
          <Link href="/leaderboard" className="hover:text-white transition">
            Leaderboard
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default PlatformFooter;