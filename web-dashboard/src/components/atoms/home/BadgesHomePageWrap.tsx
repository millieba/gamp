import React from "react";

interface BadgesHomePageWrapProps {
  badgeCards: React.JSX.Element[];
  title: string;
}

const BadgesHomePageWrap: React.FC<BadgesHomePageWrapProps> = ({ badgeCards, title }) => {
  const bgColor = "bg-DarkNeutral100";

  return (
    <div className={`rounded-lg shadow-md ${bgColor} p-4`}>
      {badgeCards.length > 0 && (
        <>
          <p>{title}</p>
          <div>{badgeCards}</div>
        </>
      )}
    </div>
  );
};

export default BadgesHomePageWrap;
