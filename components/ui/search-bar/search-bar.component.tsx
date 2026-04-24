"use client";

import SearchButton from "../buttons/search-button.component";
import { useState } from "react";

export default function SearchBar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const searchBarContent = [
    {
      label: "Where",
      subLabels: "Search destinations",
    },
    { label: "When", subLabels: "Add dates" },
    { label: "Who", subLabels: "Add guests" },
  ];

  return (
    <div className="min-w-[850px] h-[66px] shadow-sm border border-[#DDDDDD] bg-white rounded-full hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-row justify-between items-center h-full">
        {searchBarContent.map((item, index) => (
          <div
            key={index}
            className="flex-1 flex flex-row justify-between items-center relative group h-full"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className={`flex-1 flex flex-row justify-between items-center group-hover:bg-[#EBEBEB] rounded-full transition-colors duration-200 cursor-pointer h-full ${
                index === 0
                  ? "pl-8 pr-6"
                  : index === searchBarContent.length - 1
                  ? "pl-6 pr-2"
                  : "px-6"
              }`}
            >
              <div className="flex flex-col justify-center items-start gap-0">
                <span
                  className="text-[0.75rem] font-semibold leading-4 text-[#222222]"
                  style={{
                    fontFamily:
                      'var(--font-circular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
                  }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[0.875rem] font-normal leading-5 text-[#717171]"
                  style={{
                    fontFamily:
                      'var(--font-circular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
                  }}
                >
                  {item.subLabels}
                </span>
              </div>
              {index === searchBarContent.length - 1 && (
                <div className="ml-2">
                  <SearchButton />
                </div>
              )}
            </div>
            {index < searchBarContent.length - 1 && (
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-[#DDDDDD] transition-opacity duration-200 ${
                  hoveredIndex === index || hoveredIndex === index + 1
                    ? "opacity-0"
                    : "opacity-100"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
