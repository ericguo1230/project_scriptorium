"use client";
import { useRouter } from "next/navigation";
import { DocumentTextIcon, TagIcon, LinkIcon } from "@heroicons/react/24/solid";
import { Status } from "@/app/actions";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createBlog } from "./actions";
import TagInput from "@/components/TagInput";
import TemplateLinkInput from "@/components/TemplateLinkInput";

export default function CreateBlog() {
  const router = useRouter();

  const initialState = { type: "default" } as Status;
  const [formState, formAction] = useFormState<Status, FormData>(
    createBlog,
    initialState
  );
  const { pending } = useFormStatus();

  const [tags, setTags] = useState<string[]>([]);
  const [templateLinks, setTemplateLinks] = useState<
    { id: number; title: string }[]
  >([]);

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

  useEffect(() => {
    if (formState.type === "success") {
      toast.success("Blog posted");
      router.push("/blogs");
    } else if (formState.type === "error") {
      toast.error("Failed to post blog");
    }

    formState.type = initialState.type;
  }, [formState.type, initialState.type, formState, router]);

  return (
    <div className="container max-w-4xl mt-10">
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
              <label className="text-sm font-medium flex items-center gap-2 text-base-content">
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
              />
            </div>

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
                  "Publish Blog"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
