import React, { ReactNode } from "react";

export interface StatDetails {
  name: string | null;
  description?: string | null;
  content?: ReactNode;
  maxWidth?: string;
}

const StatCard: React.FC<StatDetails> = ({ name, description, content, maxWidth }) => {
  return (
    <div className={`p-8 rounded-lg shadow-md bg-DarkNeutral100`} style={{ maxWidth: maxWidth ? maxWidth : "" }}>
      {name ? (
        <h1 className="text-2xl font-bold mb-4 pr-4 text-DarkNeutral1000">{name}</h1>
      ) : (
        <div className="bg-DarkNeutral300 animate-pulse h-8 w-60 rounded-full mb-5"></div>
      )}
      {description === null && description !== undefined ? (
        <div className="bg-DarkNeutral300 animate-pulse h-4 w-3/5 rounded-full mb-5"></div>
      ) : (
        <p className="text-DarkNeutral1100 pr-4 mb-4">{description}</p>
      )}

      <div className="text-DarkNeutral1100">{content}</div>
    </div>
  );
};

export default StatCard;
