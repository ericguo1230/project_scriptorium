import client from "@/clients/api";
import CommentListItem from "@/components/CommentListItem";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import CommentReplyCreate from "@/components/CommentReplyCreate";
import CommentList from "@/components/CommentList";

async function fetchBlogComment(slug: number, commentId: number) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const blogComment = await client.GET(
    "/api/v1/blog-posts/{blogPostId}/comments/{commentId}",
    {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params: {
        path: {
          blogPostId: slug,
          commentId,
        },
      },
    }
  );

  if (!blogComment.data?.data) {
    redirect("/404");
  }

  return blogComment.data.data;
}

async function fetchReplies(slug: number, commentId: number, page?: number) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const replies = await client.GET(
    "/api/v1/blog-posts/{blogPostId}/comments/{commentId}/replies",
    {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params: {
        path: {
          blogPostId: slug,
          commentId,
        },
        query: {
          page,
        },
      },
    }
  );

  if (!replies.data) {
    throw new Error("Failed to fetch replies");
  }

  return replies.data;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: number; commentId: number }>;
  searchParams: Promise<{
    page?: number;
  }>;
}) {
  const { slug, commentId } = await params;
  const { page } = await searchParams;

  const blogComment = await fetchBlogComment(slug, commentId);
  const replies = await fetchReplies(slug, commentId, page);

  return (
    <div className="container max-w-3xl">
      <div className="breadcrumbs text-sm mb-5">
        <ul>
          <li>
            <Link href="/blogs">Blogs</Link>
          </li>
          <li>
            <Link href={`/blogs/${blogComment.blogPost.id}`}>
              {blogComment.blogPost.title}
            </Link>
          </li>
          <li>Comment</li>
        </ul>
      </div>

      <CommentListItem comment={blogComment} showReply={false} />

      <div className="divider" />

      <h3 className="text-2xl font-bold mb-5">Replies</h3>
      <CommentReplyCreate parentId={commentId.toString()} postId={slug.toString()} />
      <CommentList comments={replies.data} />
    </div>
  );
}
