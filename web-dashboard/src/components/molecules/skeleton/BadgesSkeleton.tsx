const BadgesSkeleton = () => {
    return (
      <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-md shadow-md bg-DarkNeutral350 w-64 h-96">
          </div>
        ))}
      </div>
    );
  };
  
  export default BadgesSkeleton;