import React from "react";

export interface BadgeCards {
  title: string;
  cards: React.JSX.Element[];
}

const BadgesWrap: React.FC<BadgeCards> = ({ title, cards }) => {
  return (
    <div className="p-4 rounded-lg shadow-md bg-DarkNeutral100 w-full">
      <h1 className="mb-4 text-xl">{title}</h1>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4`}>
        {cards}
      </div>
    </div>
  );
};

export default BadgesWrap;
