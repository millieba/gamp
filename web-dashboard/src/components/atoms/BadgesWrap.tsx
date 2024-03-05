import React from "react";

export interface BadgeCards {
  title: string;
  cards: React.JSX.Element[];
}

const BadgesWrap: React.FC<BadgeCards> = ({ title, cards }) => {
  const bgColor = "bg-DarkNeutral100";

  return (
    <>
      <h1>{title}</h1>
      <div className={`p-4 m-2 rounded-lg shadow-md ${bgColor} flex-container`}>{cards}</div>
    </>
  );
};

export default BadgesWrap;
