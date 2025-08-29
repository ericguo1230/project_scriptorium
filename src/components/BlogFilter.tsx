"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/solid";
import TagInput from "./TagInput";
import { useSession } from "@/context/sessionProvider";

type SortKey =
  | "newest"
  | "oldest"
  | "rating_desc"
  | "rating_asc"
  | "controversial_desc"
  | "controversial_asc"
  | "reports_desc"
  | "reports_asc";
type SortOption = {
  sortBy: "createdAt" | "rating" | "report" | "controversial";
  sortDirection: "asc" | "desc";
};

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "rating_desc", label: "Highest Rating" },
  { value: "rating_asc", label: "Lowest Rating" },
  { value: "controversial_desc", label: "Most Controversial" },
  { value: "controversial_asc", label: "Least Controversial" },
];

const sortOptionsMap: Record<SortKey, SortOption> = {
  newest: { sortBy: "createdAt", sortDirection: "desc" },
  oldest: { sortBy: "createdAt", sortDirection: "asc" },
  rating_desc: { sortBy: "rating", sortDirection: "desc" },
  rating_asc: { sortBy: "rating", sortDirection: "asc" },
  reports_desc: { sortBy: "report", sortDirection: "desc" },
  reports_asc: { sortBy: "report", sortDirection: "asc" },
  controversial_desc: { sortBy: "controversial", sortDirection: "desc" },
  controversial_asc: { sortBy: "controversial", sortDirection: "asc" },
};

function BlogFilter() {
  const session = useSession();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [templateContent, setTemplateContent] = useState("");

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortKey | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const onTagAdd = (tag: string) => {
    setTags([...tags, tag]);
  };

  const onTagRemove = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  useEffect(() => {
    if (!selectedSort) {
      return;
    }

    const { sortBy, sortDirection } = sortOptionsMap[selectedSort];

    const params = new URLSearchParams(searchParams);
    params.set("sortBy", sortBy);
    params.set("sortDirection", sortDirection);

    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams, selectedSort]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.set("title", title);
    params.set("tags", tags.join(","));
    params.set("description", description);
    params.set("templateContent", templateContent);

    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
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
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                  <ArrowsUpDownIcon className="w-4 h-4" />
                  Sort By
                </label>
                <select
                  value={selectedSort || ""}
                  onChange={(e) => setSelectedSort(e.target.value as SortKey)}
                  className="select select-sm select-bordered w-full"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {session.session?.role === "admin" && (
                    <>
                      <option value="reports_desc">Most Reported</option>
                      <option value="reports_asc">Least Reported</option>
                    </>
                  )}
                </select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by description..."
                  className="input input-sm input-bordered w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Content
                </label>
                <input
                  type="text"
                  placeholder="Search by content..."
                  className="input input-sm input-bordered w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Template Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Template Content
                </label>
                <input
                  type="text"
                  placeholder="Search by template content..."
                  className="input input-sm input-bordered w-full"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                  <TagIcon className="w-4 h-4" />
                  Tags
                </label>
                <TagInput
                  tags={tags}
                  onTagAdd={onTagAdd}
                  onTagRemove={onTagRemove}
                />
              </div>

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

export default BlogFilter;
