"use client";
import { useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  TrashIcon,
  PencilSquareIcon,
  LinkIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { components } from "@/clients/api/v1";

import { useSession } from "@/context/sessionProvider";
import DeleteConfirmation from "./DeleteConfirmation";
import { deleteBlogPost, rateBlogPost } from "@/app/actions";

import { toast } from "react-toastify";
import { timeToRead } from "@/utils/misc";
import RateButton from "./RateButton";
import ReportModal from "./ReportModal";

type Blog = components["schemas"]["Blog"];

interface BlogViewProps {
  blog: Blog;
}

function BlogView({ blog }: BlogViewProps) {
  const session = useSession();

  const deleteConfirmationRef = useRef<HTMLDialogElement>(null);
  const reportRef = useRef<HTMLDialogElement>(null);

  const readTime = useMemo(() => {
    return timeToRead(blog.description);
  }, [blog.description]);

  const formattedDate = useMemo(() => {
    return new Date(blog.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }, [blog.createdAt]);

  const onConfirmDelete = async () => {
    await deleteBlogPost(blog.id);
    toast.success("Blog post deleted");
  };

  const onUpvote = async () => {
    if (!session?.session) {
      toast.error("Please login to upvote");
      return;
    }

    try {
      await rateBlogPost(blog.id, "+1");
    } catch {
      toast.error("Please login to upvote");
    }
  };

  const onDownvote = async () => {
    if (!session?.session) {
      toast.error("Please login to downvote");
      return;
    }

    try {
      await rateBlogPost(blog.id, "-1");
    } catch {
      toast.error("Please login to downvote");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy the link: ", err);
      });
  };

  const authorName = useMemo(() => {
    return blog.user.firstName + " " + blog.user.lastName;
  }, [blog.user.firstName, blog.user.lastName]);

  return (
    <>
      <div className="container max-w-3xl mx-auto p-6 space-y-8">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href="/blogs">Blogs</Link>
            </li>
            <li>{blog.title}</li>
          </ul>
        </div>

        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1 flex-wrap">
              {blog.tags.length == 0 && (
                <span className="badge badge-secondary text-secondary-content w-20 text-ellipsis overflow-hidden">
                  {"No tags"}
                </span>
              )}
              {blog.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="badge badge-secondary text-secondary-content text-ellipsis overflow-hidden"
                >
                  {tag.tag}
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <span>{formattedDate}</span>
              {blog.isVisible === false && (
                <span className="badge badge-error min-w-32">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Post is Hidden
                </span>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold">{blog.title}</h1>
          <div className="flex items-center space-x-4">
            <div className="avatar">
              <div className="h-12 w-12 rounded-full">
                <Image
                  src={blog.user.avatar}
                  alt={authorName}
                  className="object-cover"
                  width={100}
                  height={100}
                />
              </div>
            </div>
            <div>
              <p className="font-medium">{authorName}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {/* <BookOpenIcon className="w-4 h-4" /> */}
                {readTime} min read
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="card">
          <div className="card-content">
            <div className="prose max-w-none">
              <p className="my-4 text-base-content leading-8">
                {blog.description}
              </p>

              <ul className="space-y-4">
                {blog.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={`/execute/${link.id}`}
                      className="btn btn-ghost w-full flex justify-start"
                    >
                      <LinkIcon className="w-3 h-3" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <RateButton
              onUpvote={onUpvote}
              onDownvote={onDownvote}
              rating={blog.netRating.toString()}
            />
            <button className="btn btn-ghost" onClick={copyToClipboard}>
              {/* <Share2 className="w-5 h-5" /> */}
              Share
            </button>
          </div>

          <div className={`md:hidden dropdown dropdown-end ${session.session ? "" : "hidden"}`}>
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle btn-ghost btn-sm"
            >
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-300 rounded-box z-[1] w-52 p-2 shadow"
            >
              {session.session && (
                <li>
                  <button onClick={() => reportRef.current?.showModal()}>
                    Report
                  </button>
                </li>
              )}

              {session?.session?.id.toString() === blog.userId.toString() && (
                <>
                  <li>
                    <Link href={`/blogs/${blog.id}/edit`}>
                      <PencilSquareIcon className="w-5 h-5" />
                      Edit
                    </Link>
                  </li>
                  <li>
                    <button
                      className="text-error"
                      onClick={() => {
                        deleteConfirmationRef.current?.showModal();
                      }}
                    >
                      <TrashIcon className="w-5 h-5" />
                      Delete
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {session?.session?.id.toString() === blog.userId.toString() && (
              <>
                <button
                  className="btn btn-ghost text-error"
                  onClick={() => {
                    deleteConfirmationRef.current?.showModal();
                  }}
                >
                  <TrashIcon className="w-5 h-5" />
                  Delete
                </button>

                <Link href={`/blogs/${blog.id}/edit`} className="btn btn-ghost">
                  <PencilSquareIcon className="w-5 h-5" />
                  Edit
                </Link>
              </>
            )}
            {session.session && (
              <button
                className="btn btn-ghost"
                onClick={() => reportRef.current?.showModal()}
              >
                Report
              </button>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmation
        ref={deleteConfirmationRef}
        onConfirm={onConfirmDelete}
        message="Are you sure you want to delete this blog?"
      />
      <ReportModal
        ref={reportRef}
        blogPostId={blog.id}
        onSaved={() => {
          reportRef.current?.close();
        }}
      />
    </>
  );
}

export default BlogView;
