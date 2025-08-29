import React, { useState } from "react";
import { useSession } from "@/context/sessionProvider";
import Link from "next/link";
import { toast } from "react-toastify";
import { deleteTemplate, updateCode } from "@/app/actions";
import PopupEditForm from "@/components/EditTemplateForm";
import "react-toastify/dist/ReactToastify.css";

interface TemplateListItemProps {
  id: number;
  title: string;
  explanation: string;
  tags?: { id: number; tag: string }[]; // Tags are objects
  createdAt: string;
  content: string;
  language: string;
  stdin?: string;
  userId: number;
  isDropdown: boolean;
  toggleDropdown: () => void;
}

function TemplateListItem({
  id,
  title,
  explanation,
  tags = [],
  createdAt,
  content,
  language,
  userId,
  isDropdown,
  toggleDropdown,
}: TemplateListItemProps) {
  const { session } = useSession();
  const [isOpen, setOpen] = useState(false);

  const tagStrings: string[] = tags.map((tag) => tag.tag);
  const [stringTags, setStringTags] = useState(tagStrings);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [initialTags, setTags] = useState(tags);
  const [initialDescription, setDescription] = useState(explanation);
  const [initialTitle, setTitle] = useState(title);
  const [error, setError] = useState("");
  const [tagInputValue, setTagInputValue] = useState("");

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  const handleDelete = async () => {
    const data = {
      templateId: id,
    };
    const response = await deleteTemplate(data);
    if (response.type === "success") {
      toast.success("Template deleted");
    } else {
      toast.error("Failed to delete template");
    }
  };

  function resetForm() {
    setStringTags(tagStrings);
    setTagInputValue("");
    setTitle(title);
    setDescription(explanation);
    setError("");
  }

  //tags in form
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInputValue(e.target.value);
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && tagInputValue.trim() !== "") {
      event.preventDefault();
      if (!stringTags.includes(tagInputValue.trim())) {
        setStringTags([...stringTags, tagInputValue.trim()]);
        setTagInputValue("");
      }
    }
  };

  const handleRemoveTag = (index: number) => {
    setStringTags(stringTags.filter((_, i) => i !== index));
  };

  const forkTemplate = async () => {
    const data = {
      id: id,
      title: title,
      fork: true,
    };
    const response = await updateCode(data);
    if (response.type === "success") {
      toast.success("Template Forked");
    } else {
      toast.error("Already forked");
    }
  };

  //api call
  const handleEditTemplate = async (formData: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    const data = {
      id: id,
      title: formData.title,
      description: formData.description,
      tags: formData.tags,
      fork: false,
    };
    const response = await updateCode(data);
    if (response.type === "success") {
      toast.success("Template Edited");
    } else {
      toast.error("You cannot edit a template that is not yours");
    }
    setOpen(false);
    resetForm();
  };

  //open edit
  const handleEdit = () => {
    setOpen(true);
  };

  return (
    <div className="relative flex gap-4 items-center">
      {/* List Item */}
      <Link href="/execute/[slug]" as={`/execute/${id}`} className="flex-1">
        <div className="p-4 border border-base-content/20 rounded-md h-full">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-base-content/80">{explanation}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {initialTags.length === 0 ? (
              <span className="badge badge-secondary text-secondary-content">
                No tags
              </span>
            ) : (
              initialTags.map((tag) => (
                <span
                  key={tag.id} // Use `id` as the unique key
                  className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded"
                >
                  {tag.tag} {/* Access the `tag` property */}
                </span>
              ))
            )}
          </div>
          <p className="text-xs text-primary mt-3">Language: {language}</p>
          <p className="text-xs text-base-content/80 mt-3">
            Created: {formattedDate}
          </p>
          <div className="mt-4">
            <pre className="bg-base-200 text-base-content p-2 rounded text-sm overflow-auto">
              {content}
            </pre>
          </div>
        </div>
      </Link>

      {/* Dropdown Menu */}
      <div className="relative flex-shrink-0">
        {session && (
          <button
            onClick={toggleDropdown}
            className="px-2 py-1 bg-base-200 rounded hover:bg-base-300"
          >
            ⋮
          </button>
        )}
        {isDropdown && (
          <div className="absolute right-0 mt-2 w-40 bg-base-300 border border-base-content/10 rounded shadow-lg z-10">
            <ul className="py-1">
              {session?.id.toString() === userId.toString() && (
                <li>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-base-200"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                </li>
              )}
              {session?.id.toString() !== userId.toString() && (
                <li>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-base-200"
                    onClick={forkTemplate}
                  >
                    Fork
                  </button>
                </li>
              )}
              {session?.id.toString() === userId.toString() && (
                <li>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 hover:bg-base-200"
                  >
                    Delete
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <PopupEditForm
        isOpen={isOpen}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        onSubmit={handleEditTemplate}
        onTitleChange={(env: React.ChangeEvent<HTMLInputElement>) =>
          setTitle(env.target.value)
        }
        onDescriptionChange={(env: React.ChangeEvent<HTMLInputElement>) =>
          setDescription(env.target.value)
        }
        error={error}
        tagsInputProps={{
          tags: stringTags,
          inputValue: tagInputValue,
          onKeyDown: handleTagKeyDown,
          onClick: handleRemoveTag,
          onChange: handleTagChange,
        }}
        initialData={{
          title: initialTitle,
          description: initialDescription,
        }}
      />
    </div>
  );
}

export default TemplateListItem;
