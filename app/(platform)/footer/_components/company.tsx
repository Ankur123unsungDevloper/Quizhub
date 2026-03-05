import Link from "next/link";

const Company = () => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-4xl font-semibold text-muted-foreground">
        Company
      </h3>

      <ul className="flex flex-col gap-2 text-sm text-start text-[#FF8D28]">
        <li>
          <Link href="/about-us" className="hover:text-white transition">
            About Us
          </Link>
        </li>

        <li>
          <Link href="/careers" className="hover:text-white transition">
            Careers
          </Link>
        </li>

        <li>
          <Link href="/contact" className="hover:text-white transition">
            Contact
          </Link>
        </li>

        <li>
          <Link href="/press" className="hover:text-white transition">
            Press
          </Link>
        </li>

        <li>
          <Link href="/partners" className="hover:text-white transition">
            Partners
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Company;