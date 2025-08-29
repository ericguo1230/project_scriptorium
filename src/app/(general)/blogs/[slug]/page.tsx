import client from "@/clients/api";
import BlogView from "@/components/BlogView";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import CommentCreate from "@/components/CommentCreate";
import CommentList from "@/components/CommentList";
import Pagination from "@/components/Pagination";
import SortSelector from "@/components/SortSelector";

async function fetchBlog(slug: number) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const blogData = await client.GET("/api/v1/blog-posts/{blogPostId}", {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
    params: {
      path: {
        blogPostId: slug,
      },
    },
  });

  if (!blogData.data?.data) {
    redirect("/error");
  }

  return blogData.data.data;
}

async function fetchComments(postId: number, { page, sortBy, sortDirection }: { page?: number; sortBy?: string; sortDirection?: string }) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const comments = await client.GET(
    "/api/v1/blog-posts/{blogPostId}/comments",
    {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params: {
        path: {
          blogPostId: postId,
        },
        query: {
          page,
          sortBy,
          sortDirection,
        },
      },
    }
  );

  if (!comments.data) {
    if (comments.response.status === 422) {
      redirect(`/blogs/${postId}`);
    } else {
      redirect("/error");
    }
  }

  return comments.data;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: number; page: number }>;
  searchParams: Promise<{
    page?: number;
    sortBy?: string;
    sortDirection?: string;
  }>;
}) {
  const { slug } = await params;
  const { page, sortBy, sortDirection } = await searchParams;

  const blogData = await fetchBlog(slug);
  const comments = await fetchComments(slug, { page, sortBy, sortDirection });

  return (
    <div className="container max-w-3xl mx-auto p-6 ">
      <BlogView blog={blogData} />

      <div className="divider"></div>

      <div className="flex justify-between">
        <h3 className="text-2xl font-bold mb-5">Comments</h3>
        <SortSelector />
      </div>

      <CommentCreate postId={slug.toString()} />
      <CommentList comments={comments.data} />

      <Pagination
        page={comments._metadata.page}
        totalPage={comments._metadata.pageCount}
      />
    </div>
  );
}
