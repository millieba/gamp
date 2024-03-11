import React from "react";

interface BadgesHomePageWrapProps {
  recentBadgesCards: React.JSX.Element[];
  approachingBadgesCards: React.JSX.Element[];
}

const BadgesHomePageWrap: React.FC<BadgesHomePageWrapProps> = ({ recentBadgesCards, approachingBadgesCards }) => {
  const bgColor = "bg-DarkNeutral100";

  return (
    <>
      <div className={`rounded-lg shadow-md ${bgColor} min-w-[500px] max-w-[700px]`}>
        <p className="pt-4 pl-4">You've recently achieved these badges:</p>
        <div className="pr-4 pt-4 pl-4 pb-2 w-full grid grid-cols-3 gap-4">{approachingBadgesCards}</div>
        <p className="pt-4 pl-4">You're really close to getting those badges:</p>
        <div className="pr-4 pt-2 pl-4 pb-4 w-full grid grid-cols-3 gap-4">{recentBadgesCards}</div>
      </div>
    </>
  );
};

export default BadgesHomePageWrap;
