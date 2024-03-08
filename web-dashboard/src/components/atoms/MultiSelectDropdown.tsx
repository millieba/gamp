import React, { useState, useEffect, useRef } from "react";

interface MultiSelectDropdownProps {
  options: string[];
  title: string;
}

const DropdownIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={isOpen ? "" : "rotate-180"}
  >
    <path d="M7 15L12 10L17 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, title }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const toggleOption = (option: string) => {
    setSelectedOptions((prevSelectedOptions) =>
      prevSelectedOptions.includes(option)
        ? prevSelectedOptions.filter((item) => item !== option)
        : [...prevSelectedOptions, option]
    );
  };

  const toggleDropdown = () => {
    setDropdownOpen((prevDropdownOpen) => !prevDropdownOpen);
  };

  const selectAllOptions = () => {
    setSelectedOptions((prevSelectedOptions) => (prevSelectedOptions.length === options.length ? [] : [...options]));
  };

  return (
    <div className="relative inline-block text-sm" ref={dropdownRef}>
      <div className="w-full">
        <button
          type="button"
          className="flex items-center justify-between w-full rounded-lg px-3 py-1.5 bg-DarkNeutral200 hover:bg-DarkNeutral100"
          onClick={toggleDropdown}
        >
          <span>{title}</span>
          <span className="ml-2">
            <DropdownIcon isOpen={dropdownOpen} />
          </span>
        </button>
      </div>

      {dropdownOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-full rounded-lg bg-DarkNeutral200 z-10 max-h-52 overflow-scroll overflow-x-hidden">
          <label className="flex items-center space-x-2 py-2 px-4 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 hover:"
              checked={selectedOptions.length === options.length}
              onChange={selectAllOptions}
              aria-checked={selectedOptions.length === options.length}
            />
            <span id="select-all">Select All</span>
          </label>

          {options.map((option) => (
            <label
              key={option}
              className={`flex items-center space-x-2 py-2 px-4 cursor-pointer hover:bg-DarkNeutral100 ${
                selectedOptions.includes(option) ? "bg-DarkNeutral100" : ""
              }`}
            >
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5"
                checked={selectedOptions.includes(option)}
                onChange={() => toggleOption(option)}
                id={`option-${option}`}
                aria-checked={selectedOptions.includes(option)}
              />
              <span id={`label-${option}`}>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
