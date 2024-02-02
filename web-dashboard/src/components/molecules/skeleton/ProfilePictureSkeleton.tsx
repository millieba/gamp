const ProfilePictureSkeleton = () => {
  return (
    <div className="animate-pulse flex flex-col items-center w-full">
      <div className="rounded-full bg-DarkNeutral300 w-24 h-24 mt-9 shadow-sm"></div>
      <div className="h-4 w-20 bg-DarkNeutral300 rounded mt-3"></div>
      <div className="h-3 w-16 bg-DarkNeutral300 rounded mt-2 italic"></div>
      <div className="flex justify-between w-full mt-2">
        <div className="h-3 w-3 bg-DarkNeutral300 rounded"></div>
        <div className="h-3 w-3 bg-DarkNeutral300 rounded"></div>
      </div>
      <div className="w-full bg-DarkNeutral300 rounded-full h-2.5 mt-2 mb-2"></div>
      <div className="h-3 w-32 bg-DarkNeutral300 rounded mb-12"></div>
    </div>
  );
};

export default ProfilePictureSkeleton;
