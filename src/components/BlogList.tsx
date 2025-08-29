"use client";
import { components } from "@/clients/api/v1";
import Blog from "@/components/BlogListItem";

type Blog = components["schemas"]["Blog"];
interface BlogProps {
  posts: Blog[];
}

function BlogList({ posts }: BlogProps) {
  if (!posts.length) {
    return (
      <div className="container mt-5">
        <p className="text-center font-bold text-base-content">No blog posts found</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="grid gap-6">
        {posts.map((post) => (
          <Blog
            key={post.id}
            blog={post}
          />
        ))}
      </div>
    </div>
  );
}

export default BlogList;
