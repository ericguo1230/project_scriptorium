import React from "react";

export interface TagsInputProps {
  tags: string[];
  inputValue: string;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick: (index: number) => void; // Update to accept index for removal
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  inputValue,
  onKeyDown,
  onClick,
  onChange,
}) => {
  return (
    <div className="w-full mx-auto">
      <label className="block text-base-content font-bold mb-2">Tags</label>
      <div className="flex flex-wrap items-center border border-base-content/20 rounded-md focus-within:ring-2 focus-within:ring-blue-500 bg-base-100">
        <input
          type="text"
          value={inputValue}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Enter a tag and press Enter"
          className="w-full px-3 py-2 border border-base-content/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-blue-500 text-white text-sm font-medium rounded-full px-3 py-1 mr-2 mb-2 flex items-center"
          >
            {tag}
            <button
              className="ml-2 text-white hover:text-gray-300 focus:outline-none"
              onClick={() => onClick(index)} // Pass the index to the handler
              aria-label={`Remove tag ${tag}`} // Accessibility improvement
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagsInput;
