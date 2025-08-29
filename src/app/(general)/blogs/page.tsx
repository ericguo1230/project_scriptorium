/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import BlogList from "@/components/BlogList";
import BlogFilter from "@/components/BlogFilter";
import Pagination from "@/components/Pagination";
import React, { Suspense } from "react";

import { PlusIcon } from "@heroicons/react/24/solid";
import client from "@/clients/api";

async function fetchBlogs(
  searchParams: {
    page?: string;
    sortBy?: string;
    sortDirection?: string;
    title?: string;
    description?: string;
    templateContent?: string;
    tags?: string;
  },
  accessToken?: string
) {
  let endpoint: "/api/v1/blog-posts" | "/api/v1/admin/blog-posts" = "/api/v1/blog-posts";

  if (searchParams.sortBy === "report") {
    endpoint = "/api/v1/admin/blog-posts";
  }

  const blogs = await client.GET(endpoint, {
    params: {
      query: {
        page: searchParams.page,
        sortBy: searchParams.sortBy,
        sortDirection: searchParams.sortDirection,
        title: searchParams.title,
        description: searchParams.description,
        templateContent: searchParams.templateContent,
        tags: searchParams.tags,
      },
    },
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });

  if (!blogs.data?.data) {
    redirect("/blogs");
  }

  return blogs.data;
}

function BlogPostsSection({
  responseDataPromise,
}: {
  responseDataPromise: Promise<any>;
}) {
  const responseData = React.use(responseDataPromise);

  return (
    <>
      {/* Blog Posts Grid */}
      <BlogList posts={responseData.data} />
      {responseData._metadata.totalCount > 0 && (
        <div className="mt-8">
          <Pagination
            page={responseData._metadata.page}
            totalPage={responseData._metadata.pageCount}
          />
        </div>
      )}
    </>
  );
}

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    title?: string;
    description?: string;
    templateContent?: string;
    tags?: string;
    sortBy?: string;
    sortDirection?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const responseDataPromise = fetchBlogs(
    {
      page: searchParams?.page,
      sortBy: searchParams?.sortBy,
      sortDirection: searchParams?.sortDirection,
      title: searchParams?.title,
      description: searchParams?.description,
      templateContent: searchParams?.templateContent,
      tags: searchParams?.tags,
    },
    accessToken
  );

  return (
    <div className="container mt-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Section */}
        <div className="flex flex-col space-y-4">
          {accessToken ?(
            <Link className="btn btn-primary" href="/blogs/new">
              <PlusIcon className="w-6 h-6" />
              New Blog
            </Link>
          ): <button className="btn btn-primary" disabled>
            <PlusIcon className="w-6 h-6" />
            Login to create a new blog
          </button>}
          <BlogFilter />
        </div>

        {/* Right Section */}
        <div className="flex-1 ">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            }
          >
            <BlogPostsSection responseDataPromise={responseDataPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
