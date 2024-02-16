import React from "react";

export interface InfoDetails {
  subheading: string;
  heading: string;
  number: number;
  description?: string;
  maxWidth?: string; // remember to specify the unit when using this prop
}

const InfoCard: React.FC<InfoDetails> = ({ subheading, heading, number, description, maxWidth }) => {
  const gradientColor = "bg-DarkNeutral300";
  return (
    <div className={`p-8 m-2 rounded-lg shadow-md ${gradientColor}`} style={{ maxWidth: maxWidth ? maxWidth : "" }}>
      <h2 className="text-DarkNeutral1000">{subheading}</h2>
      <div className="flex">
        <h1 className="text-2xl font-bold pr-4 text-DarkNeutral1100">
          {number} {heading.toLowerCase()}
        </h1>
      </div>
      <p className="text-Teal600 font-bold">SOMETHING.</p>
      <p className="text-DarkNeutral1100 pr-4">{description}</p>
    </div>
  );
};

export default InfoCard;
