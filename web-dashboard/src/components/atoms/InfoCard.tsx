import React from "react";

export interface InfoDetails {
  subheading: string;
  number: number;
  unit: string;
  description?: string;
  maxWidth?: string; // remember to specify the unit when using this prop
}

const InfoCard: React.FC<InfoDetails> = ({ subheading, number, unit, description, maxWidth }) => {
  const gradientColor = "bg-DarkNeutral300";
  return (
    <div
      className={`p-8 m-2 rounded-lg shadow-md ${gradientColor} overflow-visible overflow-wrap-anywhere`}
      style={{ maxWidth: maxWidth ? maxWidth : "" }}
    >
      <div className="flex">
        <h1 className="text-2xl font-bold pr-4 text-DarkNeutral1100">
          {number} {unit}
        </h1>
      </div>
      <p className="text-Teal600 font-bold">{subheading}</p>
      <p className="text-DarkNeutral1100 pr-4">{description}</p>
    </div>
  );
};

export default InfoCard;
