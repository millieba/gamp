import React from "react";

interface BadgesHomePageWrapProps {
  recentBadgesCards: React.JSX.Element[];
  approachingBadgesCards: React.JSX.Element[];
}

const BadgesHomePageWrap: React.FC<BadgesHomePageWrapProps> = ({ recentBadgesCards, approachingBadgesCards }) => {
  const bgColor = "bg-DarkNeutral100";

  return (
    <>
      <div className={`rounded-lg shadow-md ${bgColor} p-2`}>
        {recentBadgesCards.length > 0 && (
          <>
            <p className="pt-1 pl-4">New Badges Earned:</p>
            <div>{recentBadgesCards}</div>
          </>
        )}
        {approachingBadgesCards.length > 0 && (
          <>
            <p className="pt-2 pl-4">Almost There:</p>
            <div>{approachingBadgesCards}</div>
          </>
        )}
      </div>
    </>
  );
};

export default BadgesHomePageWrap;
