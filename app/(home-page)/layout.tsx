const HomepageLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full flex">
      {children}
    </div>
  );
};

export default HomepageLayout;