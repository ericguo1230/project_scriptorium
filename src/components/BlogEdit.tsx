"use client";

import { components } from "@/clients/api/v1";
import { DocumentTextIcon, LinkIcon, TagIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TagInput from "./TagInput";
import { useEffect, useState } from "react";
import TemplateLinkInput from "./TemplateLinkInput";
import { Status } from "@/app/actions";
import { useFormState, useFormStatus } from "react-dom";
import { editBlogPost } from "@/actions/blogActions";
import { toast } from "react-toastify";
import { useSession } from "@/context/sessionProvider";

type Blog = components["schemas"]["Blog"];

interface BlogEditProps {
  blog: Blog;
}

export default function BlogEdit({ blog }: BlogEditProps) {
  const session = useSession();
  const router = useRouter();

  const initialState = { type: "default" } as Status;
  const [formState, formAction] = useFormState<Status, FormData>(
    editBlogPost,
    initialState
  );
  const { pending } = useFormStatus();

  useEffect(() => {
    if (formState.type === "success") {
      router.push("/blogs");
    } else if (formState.type === "error") {
      toast.error("Failed to edit blog");
    }

    formState.type = initialState.type;
  }, [formState.type, initialState.type, formState, router]);

  const [tags, setTags] = useState<string[]>(blog.tags.map((tag) => tag.tag));
  const [templateLinks, setTemplateLinks] = useState<
    { id: number; title: string }[]
  >(blog.links);

  if (session?.session?.id.toString() !== blog.userId.toString()) {
    router.replace("/blogs");

    return (
      <div className="container max-w-3xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-bold">
          You are not authorized to edit this blog
        </h1>
      </div>
    );
  }

  const onTagAdd = (tag: string) => {
    setTags([...tags, tag]);
  };

  const onTagRemove = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onTemplateLinkAdd = (templateLink: { id: number; title: string }) => {
    setTemplateLinks([...templateLinks, templateLink]);
  };

  const onTemplateLinkRemove = (templateId: number) => {
    setTemplateLinks(
      templateLinks.filter((templateLink) => templateLink.id !== templateId)
    );
  };

  return (
    <div className="container max-w-3xl mx-auto p-6 space-y-8">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/blogs">Blogs</Link>
          </li>
          <li>
            <Link href="/blogs/[slug]" as={`/blogs/${blog.id}`}>
              {blog.title}
            </Link>
          </li>
          <li>Edit</li>
        </ul>
      </div>

      <div className="card card-bordered border-base-300 bg-base-200/25 mb-5">
        <div className="card-body space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Create New Blog Post</h1>
            <button
              onClick={() => router.back()}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
          </div>

          <form action={formAction} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                <DocumentTextIcon className="w-4 h-4" />
                Title
              </label>
              <input
                type="text"
                required
                name="title"
                placeholder="Enter blog title"
                className="input input-sm input-bordered w-full"
                defaultValue={blog.title}
              />
            </div>

            {/* Tags */}
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
              <input type="hidden" name="tags" value={tags.join(",")} />
            </div>

            {/* Links */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <LinkIcon className="w-4 h-4" />
                Template Links
              </label>
              <TemplateLinkInput
                templateLinks={templateLinks}
                onTemplateLinkAdd={onTemplateLinkAdd}
                onTemplateLinkRemove={onTemplateLinkRemove}
              />
              <input
                type="hidden"
                name="templateLinks"
                value={JSON.stringify(templateLinks)}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-base-content">
                Content
              </label>
              <textarea
                required
                name="description"
                placeholder="Write your blog content here..."
                rows={10}
                className="textarea textarea-bordered w-full"
                defaultValue={blog.description}
              ></textarea>
            </div>

            <input type="hidden" name="blogPostId" value={blog.id} />

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={pending}
              >
                {pending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Edit Blog"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
