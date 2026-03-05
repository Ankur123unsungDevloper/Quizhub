const Social = () => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-4xl font-semibold text-muted-foreground">
        Follow Us
      </h3>
      <ul className="flex flex-col gap-2 text-sm text-start text-[#FF8D28]">
        <li>
          <a
            href="https://www.twitter.com/quizhub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Twitter / X
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/company/quizhub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            LinkedIn
          </a>
        </li>
        <li>
          <a
            href="https://www.youtube.com/quizhub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            YouTube
          </a>
        </li>
        <li>
          <a
            href="https://www.instagram.com/quizhub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Instagram
          </a>
        </li>
        <li>
          <a
            href="https://www.facebook.com/quizhub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Facebook
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Social;