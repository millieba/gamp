import React, { useEffect } from "react";

interface StreakViewProps {
  title: String;
  children: String;
  description?: String;
  streakAdditionalInfo?: number | null | undefined;
}

const ShortStatView = ({ title, children, description, streakAdditionalInfo }: StreakViewProps) => {
  useEffect(() => {
    console.log("title", title);
    console.log("streakAdditionalInfo", streakAdditionalInfo);
  }, [title, streakAdditionalInfo]);
  return (
    <div className="grid p-4 items-center smallBounce">
      <h1>
        <b>{title}</b>
      </h1>
      <p>{children}</p>
      {description && <p className="text-xs">{description}</p>}
    </div>
  );
};

export default ShortStatView;
