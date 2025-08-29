"use client";

import { fetchTemplateBlogs } from "@/actions/templateActions";
import { LinkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useEffect, useState } from "react";
import Pagination from "./PaginationAlt";

export default function TemplateBlogPostsTab({
  templateId,
}: {
  templateId: number | undefined;
}) {
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [blogs, setBlogs] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    if (!templateId) {
      return;
    }

    const fetchData = async () => {
      const data = await fetchTemplateBlogs(templateId, page);
      if (!data?.data) {
        return;
      }

      setBlogs(data.data);
      setTotalPages(data._metadata!.pageCount!);
    };

    fetchData().catch((error) => {
      console.error(error);
    });
  }, [page, templateId, setBlogs]);

  return (
    <div>
      <ul className="space-y-4">
        {blogs.map(({id, title}) => (
          <li key={id}>
            <Link
              href={`/blogs/${id}`}
              className="btn btn-ghost w-full flex justify-start"
            >
              <LinkIcon className="w-3 h-3" />
              {title}
            </Link>
          </li>
        ))}
      </ul>

      { (totalPages && totalPages > 0) ? <Pagination totalPage={totalPages} page={page} onPageChange={setPage} /> : <div className="text-center">No blog posts</div> }
    </div>
  );
}
