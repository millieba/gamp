import { useRef, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import BadgesWrapped from "./BadgesWrapped";

// Inspired by https://github.com/Sridhar-C-25/react-createabl-multi-selector/blob/main/src/App.jsx

// Keep in mind that if this list is modified, the BadgesWrapped component may be affected by it.
export const tags: string[] = [
  "Earned badges",
  "Upcoming badges",
  "Issue badges",
  "Commit badges",
  "Pull request badges",
  "Miscellaneous badges",
];

const BadgesDropDown = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(tags.slice(0, 2)); // default selected tags are the two first in the tags array.
  const [suggestionsOpen, setSuggestionOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null); // Add type annotation for inputRef

  const filteredTags = tags.filter(
    (item) =>
      item?.toLocaleLowerCase()?.includes(searchQuery.toLocaleLowerCase()?.trim()) && !selectedTags.includes(item)
  );

  // If the searchQuery is empty or if the selectedTags array contains the search query.
  const isDisable =
    !searchQuery?.trim() ||
    selectedTags.filter((item) => item?.toLocaleLowerCase()?.trim() === searchQuery?.toLocaleLowerCase()?.trim())
      ?.length;

  return (
    <div className="mt-2 mb-2">
      <div className="text-sm mb-5">
        {/* The search bar where the user can search for the wanted tag */}
        <div className="card flex items-center justify-between p-3 gap-2.5 rounded-lg w-[70%] min-w-[300px] bg-DarkNeutral350 text-DarkNeutral1100">
          <MagnifyingGlassIcon className="w-[20px] text-darkNeutral1100" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.trimStart())}
            placeholder="Select categories to show"
            className="bg-transparent text-sm flex-1"
            onFocus={() => setSuggestionOpen(true)}
            onBlur={() => setSuggestionOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isDisable) {
                setSelectedTags((prev) => [...prev, searchQuery]);
                setSearchQuery("");
                setSuggestionOpen(true);
              }
            }}
          />
        </div>

        {/* Dropdown scrollbar with the tags options */}
        {suggestionsOpen && (
          <div className="card absolute w-[40%] max-h-52 p-1 ml-10 flex overflow-y-auto scrollbar-thin scrollbar-thumb-rounded z-50 bg-DarkNeutral200 rounded-lg">
            <ul className="w-full">
              {filteredTags?.length ? (
                filteredTags.map((tag, i) => (
                  <li
                    key={i}
                    className="p-2 cursor-pointer hover:bg-DarkNeutral100 rounded-md w-full"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSuggestionOpen(true);
                      setSelectedTags((prev) => [...prev, tag]);
                      setSearchQuery("");
                    }}
                  >
                    {tag}
                  </li>
                ))
              ) : (
                <li className="p-2 text-DarkNeutral350">You have chosen all available options.</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {!(selectedTags?.length === 0) ? (
        <>
          <p>Selected badge categories:</p>
          <div className="relative text-xs flex flex-wrap gap-1 p-2 mb-4">
            {selectedTags.map((tag) => {
              return (
                <div
                  key={tag}
                  className="bg-DarkNeutral1100 hover:bg-DarkNeutral1000 rounded-full w-fit py-1.5 px-3 border border-DarkNeutral350 text-DarkNeutral350
                    flex items-center gap-2 cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSelectedTags(selectedTags.filter((i) => i !== tag))}
                >
                  {tag}
                  <div>
                    <XMarkIcon className="w-[20px] text-DarkNeutral350 " />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 pl-2">
              <span
                className="text-DarkNeutral1100 hover:text-DarkNeutral1000 text-sm cursor-pointer"
                onClick={() => {
                  setSelectedTags([]);
                  inputRef.current?.focus();
                }}
              >
                Clear all
              </span>
            </div>
          </div>
          <BadgesWrapped selectedTags={selectedTags} />
        </>
      ) : (
        <p>No badge categories chosen! Pick from the list above.</p>
      )}
    </div>
  );
};

export default BadgesDropDown;
