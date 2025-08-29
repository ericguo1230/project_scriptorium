"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type SortKey = "newest" | "oldest" | "rating_desc" | "rating_asc";
type SortOption = {
  sortBy: "createdAt" | "rating";
  sortDirection: "asc" | "desc";
};

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "rating_desc", label: "Highest Rating" },
  { value: "rating_asc", label: "Lowest Rating" },
];

const sortOptionsMap: Record<SortKey, SortOption> = {
  newest: { sortBy: "createdAt", sortDirection: "desc" },
  oldest: { sortBy: "createdAt", sortDirection: "asc" },
  rating_desc: { sortBy: "rating", sortDirection: "desc" },
  rating_asc: { sortBy: "rating", sortDirection: "asc" },
};

export default function SortSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedSort, setSelectedSort] = useState<SortKey>("newest");

  useEffect(() => {
    const { sortBy, sortDirection } = sortOptionsMap[selectedSort];

    const params = new URLSearchParams(searchParams);
    params.set("sortBy", sortBy);
    params.set("sortDirection", sortDirection);

    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams, selectedSort]);

  return (
    <select
      value={selectedSort}
      onChange={(e) => setSelectedSort(e.target.value as SortKey)}
      className="select select-sm"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
