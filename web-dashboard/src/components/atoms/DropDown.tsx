export interface DropDownProps {
  firstOption: string;
}

const DropDown: React.FC<DropDownProps> = ({ firstOption }) => {
  return <p>{firstOption}</p>;
};

export default DropDown;
