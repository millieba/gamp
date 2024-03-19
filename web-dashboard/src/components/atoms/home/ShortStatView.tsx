import React, { useEffect } from "react";

interface StreakViewProps {
  title: String;
  children: String;
  description?: String;
  streakAdditionalInfo?: number | null | undefined;
}

const ShortStatView = ({ title, children }: StreakViewProps) => {
  return (
    <div className="grid p-1 items-center smallBounce">
      <h1 className="text-sm">
        <b>{title}</b>
      </h1>
      <p className="text-xs">{children}</p>
      {/* {description && <p className="text-xs">{description}</p>} */}
    </div>
  );
};

export default ShortStatView;
