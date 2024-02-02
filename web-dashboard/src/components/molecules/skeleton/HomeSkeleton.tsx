const HomeSkeleton = () => {
  return (
    <div className="animate-pulse flex flex-col w-full">
      <div className={`h-10 w-20 bg-DarkNeutral350 rounded mb-1`}></div>
      <div className={`h-8 w-48 bg-DarkNeutral350 rounded`}></div>
    </div>
  );
};

export default HomeSkeleton;
