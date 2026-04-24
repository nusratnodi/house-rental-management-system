"use client";
import { IoSearch } from "react-icons/io5";

export default function SearchButton() {
  return (
    <div className="bg-[color:var(--primary-pink)] text-[color:var(--primary-white)] font-bold rounded-full p-4 cursor-pointer hover:shadow-md transition-shadow duration-200">
      <IoSearch size={20} />
    </div>
  );
}
