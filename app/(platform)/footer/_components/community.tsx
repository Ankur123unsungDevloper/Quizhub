const Community = () => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-4xl font-semibold text-muted-foreground">
        Community
      </h3>
      <ul className="flex flex-col gap-2 text-sm text-start text-[#FF8D28]">
        <li>
          <a
            href="https://discord.com/invite/quizhub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Discord
          </a>
        </li>
        <li>
          <a
            href="https://www.reddit.com/r/quizhub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Reddit
          </a>
        </li>
        <li>
          <a
            href="https://github.com/quizhub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            GitHub
          </a>
        </li>
        <li>
          <a
            href="https://github.com/quizhub/quizhub/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Report Issue
          </a>
        </li>
        <li>
          <a
            href="https://github.com/quizhub/quizhub/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Feedback
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Community;