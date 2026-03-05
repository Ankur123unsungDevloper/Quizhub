import Link from "next/link";

const Legal = () => {
  return (
    <div className="flex flex-col gap-4 relative bottom-3">
      <h3 className="text-4xl font-semibold text-muted-foreground">
        Legal
      </h3>

      <ul className="flex flex-col gap-2 text-sm text-start text-[#FF8D28]">
        <li>
          <Link href="/privacy" className="hover:text-white transition">
            Privacy Policy
          </Link>
        </li>

        <li>
          <Link href="/terms" className="hover:text-white transition">
            Terms of Service
          </Link>
        </li>

        <li>
          <Link href="/cookies" className="hover:text-white transition">
            Cookie Policy
          </Link>
        </li>

        <li>
          <Link href="/disclaimer" className="hover:text-white transition">
            Disclaimer
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Legal;