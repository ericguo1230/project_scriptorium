/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import LanguageDropdownFilter from "@/components/LanguageDropdownFilter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/context/sessionProvider";
import {
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

interface TagListProps {
  tags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

function TagList({ tags, onTagAdd, onTagRemove }: TagListProps) {
  const [tagInput, setTagInput] = useState("");

  const handleTagAdd = () => {
    if (tags.includes(tagInput.trim()) || !tagInput.trim()) return;

    onTagAdd(tagInput.trim());
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
          disabled={!tagInput.trim()}
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagRemove(tag)}
            className="badge badge-primary flex items-center gap-1"
          >
            {tag}
            <XMarkIcon className="w-3 h-3" />
          </button>
        ))}
      </div>
    </div>
  );
}


function TemplateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  let isAuth = false;
  const { session } = useSession();
  const [isChecked, changeChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([])
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const onTagAdd = (tag: string) => setTags((prev) => [...prev, tag]);
  const onTagRemove = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  useEffect(() => {
    const params = new URLSearchParams(searchParams as any);
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  if (session){
    isAuth = true
  }

  const handleCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeChecked(event.target.checked);
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams as any);
    params.set("title", title);
    params.set("tags", tags.join(","));
    params.set("description", description);;
    const transformedList = selectedLanguage.map((item) =>
      item === "C++" ? "cpp" : item.toLowerCase()
    );
    const languages = transformedList.join(", ");
    if (isChecked && session){
      params.set("userId", session.id.toString())
    }else if(!isChecked && session){
      params.delete("userId")
    }
    params.set("languages", languages);
    params.delete("page"); // Reset pagination when applying new filters
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSelectLanguage = (language: string) => {
    if (!selectedLanguage.includes(language)) {
      setSelectedLanguage([...selectedLanguage, language]);
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setSelectedLanguage(selectedLanguage.filter((lang) => lang !== language));
  };
  return (
    <div>
      <button
        onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-base-200 rounded-lg shadow-sm mb-4"
      >
        <FunnelIcon className="w-4 h-4" />
        Filters
      </button>

      <div
        className={`w-full md:w-64 flex-shrink-0 ${
          isMobileFilterOpen ? "" : "hidden"
        } md:block`}
      >
        <div className="sticky top-8">
          <div className="space-y-6 p-6 bg-base-200/25 border border-base-300 rounded-lg shadow-sm">
            <div className="space-y-4">
              {/* Search by Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Search by title..."
                  className="input input-sm input-bordered w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                  <TagIcon className="w-4 h-4" />
                  Tags
                </label>
                <TagList tags={tags} onTagAdd={onTagAdd} onTagRemove={onTagRemove} />
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Languages
                </label>
                <LanguageDropdownFilter
                  selectedLanguages={selectedLanguage}
                  onSelectLanguage={handleSelectLanguage}
                  onRemoveLanguage={handleRemoveLanguage}
                />
              </div>

              {/* Search by Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Search by description..."
                  className="input input-sm input-bordered w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {isAuth && <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                  <FunnelIcon className="w-4 h-4" />
                  Your templates...
                </label>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleCheckChange}
                  className="checkbox checkbox-primary focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                />
              </div>}

              <button
                className="btn btn-ghost btn-sm w-full"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateFilter;
