import Link from "next/link";

const Resources = () => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-4xl font-semibold text-muted-foreground">
        Resources
      </h3>

      <ul className="flex flex-col gap-2 text-sm text-start text-[#FF8D28]">
        <li>
          <Link href="/study-materials" className="hover:text-white transition">
            Study Materials
          </Link>
        </li>

        <li>
          <Link href="/blog" className="hover:text-white transition">
            Blog
          </Link>
        </li>

        <li>
          <Link href="/documentation" className="hover:text-white transition">
            Documentation
          </Link>
        </li>

        <li>
          <Link href="/help-center" className="hover:text-white transition">
            Help Center
          </Link>
        </li>

        <li>
          <Link href="/tutorials" className="hover:text-white transition">
            Tutorials
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Resources;