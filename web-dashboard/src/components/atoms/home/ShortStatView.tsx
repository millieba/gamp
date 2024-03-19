import React, { useEffect } from "react";

interface StreakViewProps {
  title: String;
  children: String;
  border: boolean;
}

const ShortStatView = ({ title, children, border }: StreakViewProps) => {
  const borderRight = border ? "border-r" : "";
  return (
    <div className={`${borderRight} border-DarkNeutral300 grid p-1 items-center smallBounce`}>
      <h1 className="text-sm">
        <b>{title}</b>
      </h1>
      <p className="text-xs">{children}</p>
      {/* {description && <p className="text-xs">{description}</p>} */}
    </div>
  );
};

export default ShortStatView;
