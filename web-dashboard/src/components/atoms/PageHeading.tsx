export const PageHeadingSkeleton = ({ width = "w-32" }: { width?: string }) => {
  return <div className={`animate-pulse bg-DarkNeutral400 mb-3 h-8 rounded-full ${width} opacity-25`}></div>;
};

const PageHeading = ({ title }: { title: string }) => {
  return <h1 className="text-2xl mb-3">{title}</h1>;
};
export default PageHeading;
