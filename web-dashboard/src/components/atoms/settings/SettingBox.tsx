const SettingBox = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="bg-DarkNeutral100 rounded-lg shadow-lg px-4 py-2 mb-4">
    <h2 className="text-lg font-bold">{title}</h2>
    <p className="text-sm my-2">{description}</p>
    {children}
  </div>
);
export default SettingBox;
