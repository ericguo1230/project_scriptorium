import { XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

interface TagListProps {
  tags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

export default function TagInput({ tags, onTagAdd, onTagRemove }: TagListProps) {
  const [tagInput, setTagInput] = useState("");

  const handleTagAdd = () => {
    if (tags.includes(tagInput)) return;

    onTagAdd(tagInput);
    setTagInput("");
  };

  const handleTagRemove = (tag: string) => {
    onTagRemove(tag);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add a tag..."
          className="input input-sm w-full input-bordered"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />
        <button
          onClick={handleTagAdd}
          className="btn btn-sm btn-primary"
          disabled={!tagInput}
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagRemove(tag)}
            className="badge badge-secondary"
          >
            {tag}
            <XMarkIcon className="w-3 h-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
