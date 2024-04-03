export const PageHeadingSkeleton = ({ width }: { width?: string }) => {
  const headingWidth = width ? `w-${width}` : "w-32";

  return <div className={`animate-pulse bg-DarkNeutral400 mb-3 h-10 rounded-full ${headingWidth} opacity-25`}></div>;
};

const PageHeading = ({ title }: { title: string }) => {
  return <h1 className="text-2xl mb-3">{title}</h1>;
};
export default PageHeading;
