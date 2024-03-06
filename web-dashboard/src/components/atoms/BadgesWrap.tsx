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
      <div
        className={`p-4 rounded-lg shadow-md ${bgColor} w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4`}
      >
        {cards}
      </div>
    </>
  );
};

export default BadgesWrap;
