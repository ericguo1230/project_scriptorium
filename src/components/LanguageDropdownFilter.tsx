"use client";
import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface LanguageDropdownFilterProps {
  selectedLanguages: string[];
  onSelectLanguage: (language: string) => void;
  onRemoveLanguage: (language: string) => void;
}

const languages = ["c", "cpp", "javascript", "typescript", "java", "python", "go", "swift", "rust", "ruby"];

function LanguageDropdownFilter({
  selectedLanguages,
  onSelectLanguage,
  onRemoveLanguage,
}: LanguageDropdownFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="space-y-2">
      {/* Input for Dropdown */}
      <div
        className="flex items-center gap-2 bg-base-100 border border-base-content/20 rounded-lg p-2 cursor-pointer"
        onClick={toggleDropdown}
      >
        <span className="text-sm text-base-content">
          Select languages...
        </span>
      </div>

      {/* Selected Languages */}
      <div className="flex flex-wrap gap-2">
        {selectedLanguages.map((language) => (
          <button
            key={language}
            onClick={() => onRemoveLanguage(language)}
            className="badge badge-primary flex items-center gap-1"
          >
            {language}
            <XMarkIcon className="w-3 h-3" />
          </button>
        ))}
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute mt-2 w-full bg-base-100 border border-base-300 rounded-md shadow-lg z-10">
          {languages.map((language) => (
            <button
              key={language}
              onClick={() => {
                onSelectLanguage(language);
                setIsDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-base-200"
            >
              {language}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageDropdownFilter;
