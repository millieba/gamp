import { useRef, useState } from "react";

export interface DropDownProps {
  firstOption: string;
}

const DropDown: React.FC<DropDownProps> = ({ firstOption }) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [menuOpen, setMenuOpen] = useState(true);

  const inputRef = useRef(null);

  const tags = ["Tutorial", "HowTo", "DIY", "Review", "Tech", "Gaming", "Travel", "Fitness", "Cooking", "Vlog"];

  const filteredTags = tags.filter(
    (item) => item?.toLocaleLowerCase()?.includes(query.toLocaleLowerCase()?.trim()) && !selected.includes(item)
  );

  const isDisable =
    !query?.trim() ||
    selected.filter((item) => item?.toLocaleLowerCase()?.trim() === query?.toLocaleLowerCase()?.trim())?.length;
  return (
    <label className="relative">
      <input type="checkbox" className="hidden peer" />

      <div className="cursor-pointer after:content-['▼'] after:text-xs after:ml-1">{"Show the dropdown"}</div>

      <div className="hidden peer-checked:flex absolute bg-white border">{"Welcome to the dropdown"}</div>
    </label>
  );
};

export default DropDown;
