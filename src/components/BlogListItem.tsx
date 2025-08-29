import { components } from "@/clients/api/v1";
import { timeToRead } from "@/utils/misc";
import { BookOpenIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useMemo } from "react";
import Image from "next/image";

type Blog = components["schemas"]["Blog"];
interface BlogProps {
  blog: Blog;
}

function BlogListItem({ blog }: BlogProps) {
  const formattedDate = useMemo(() => {
    return new Date(blog.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }, [blog.createdAt]);

  const authorName = useMemo(() => {
    return blog.user.firstName + " " + blog.user.lastName;
  }, [blog.user.firstName, blog.user.lastName]);

  return (
    <Link href="/blogs/[slug]" as={`/blogs/${blog.id}`}>
      <article className="bg-base-200/25 rounded-lg border border-base-300 p-6 hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="space-x-2">
              {blog.tags.length == 0 && (
                <span className="badge badge-secondary text-secondary-content">
                  No tags
                </span>
              )}
              {blog.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="badge badge-secondary text-secondary-content"
                >
                  {tag.tag}
                </span>
              ))}
            </div>
            <span>{formattedDate}</span>
          </div>
          <h2 className="text-xl font-semibold">{blog.title}</h2>
          <p className="text-base-content/70 line-clamp-3">
            {blog.description}
          </p>
          
          <div className="divider" />
          
          <div className="flex items-center justify-between pt-4">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="avatar">
                <div className="rounded-full w-10 h-10">
                  <Image src={blog.user.avatar} alt={authorName} width={80} height={80}  />
                </div>
              </div>
              
              <div className="text-sm">
                <p className="font-medium text-base-content">{authorName}</p>
              </div>
            </div>

            {/* Read Time */}
            <div className="flex items-center gap-2 text-sm text-base-content">
              <BookOpenIcon className="w-4 h-4" />
              {timeToRead(blog.description)} min read
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default BlogListItem;
