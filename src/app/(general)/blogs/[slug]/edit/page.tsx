import { cookies } from "next/headers";
import client from "@/clients/api";
import BlogEdit from "@/components/BlogEdit";
import { redirect } from "next/navigation";

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

export default async function Page({
  params,
}: {
  params: Promise<{ slug: number; page: number }>;
}) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);

  return <BlogEdit blog={blog} />;
}
