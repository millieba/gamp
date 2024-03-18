import React from "react";

interface StreakViewProps {
  title: String;
  children: String;
  description: String;
}

const StreakView = ({ title, children, description }: StreakViewProps) => {
  return (
    <div className="rounded-lg shadow-md bg-DarkNeutral100 grid p-4 items-center smallBounce">
      {/* <div className="bouncy"> */}
      <h1>
        <b>{title}</b> {children}
      </h1>
      <p>{description}</p>
      {/* </div> */}
    </div>
  );
};

export default StreakView;
