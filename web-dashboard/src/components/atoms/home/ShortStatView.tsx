import { ReactNode } from "react";

interface StreakViewProps {
  title: String;
  children: String;
  border: boolean;
}

interface StreackViewSkeletonProps {
  children: ReactNode;
  border: boolean;
  width?: number;
}

export const ShortStatViewSkeleton = ({ children, border, width }: StreackViewSkeletonProps) => {
  const borderRight = border ? "md:border-r" : "";
  const headingWidth = width ? `w-${width}` : "w-32";
  return (
    <div className={`${borderRight} border-DarkNeutral300 grid p-1 items-center smallBounce`}>
      <div className={`animate-pulse bg-DarkNeutral300 rounded-full h-4 mb-1 ${headingWidth}`}></div>
      <div style={{ width: width }}>{children}</div>
    </div>
  );
};

const ShortStatView = ({ title, children, border }: StreakViewProps) => {
  const borderRight = border ? "md:border-r" : "";
  return (
    <div className={`${borderRight} border-DarkNeutral300 grid p-1 items-center smallBounce`}>
      <h1 className="text-sm">
        <b>{title}</b>
      </h1>
      <p className="text-xs">{children}</p>
    </div>
  );
};

export default ShortStatView;
