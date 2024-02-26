import React, { ReactElement } from "react";

export interface StatDetails {
  name: string;
  description?: string;
  content?: ReactElement<any, any>;
  maxWidth?: string;
}

const StatCard: React.FC<StatDetails> = ({ name, description, content, maxWidth }) => {
  const gradientColor = "bg-DarkNeutral300";
  return (
    <div className={`p-8 m-2 rounded-lg shadow-md ${gradientColor}`} style={{ maxWidth: maxWidth ? maxWidth : "" }}>
      <h1 className="text-2xl font-bold mb-4 pr-4 text-DarkNeutral1000">{name}</h1>
      <p className="text-DarkNeutral1100 pr-4">{description}</p>
      <div className="text-DarkNeutral1100">{content}</div>
    </div>
  );
};

export default StatCard;
