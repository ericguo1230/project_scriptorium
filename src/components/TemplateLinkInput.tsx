import { useState } from "react";
import { LinkIcon, TrashIcon } from "@heroicons/react/24/solid";
import { fetchTemplate } from "@/actions/templateActions";
import { toast } from "react-toastify";

interface TamplateLinkInputProps {
  templateLinks: {
    id: number;
    title: string;
  }[];
  onTemplateLinkAdd: (templateLink: { id: number; title: string }) => void;
  onTemplateLinkRemove: (templateId: number) => void;
}

export default function TemplateLinkInput({
  templateLinks,
  onTemplateLinkAdd,
  onTemplateLinkRemove,
}: TamplateLinkInputProps) {
  const [tagInput, setTagInput] = useState("");
  const [fetchError, setFetchError] = useState(false);

  const handleTemplateLinkAdd = async () => {
    const tagInputInt = parseInt(tagInput);
    if (isNaN(tagInputInt)) {
      setFetchError(true);
      return;
    }

    if (
      templateLinks.map((templateLink) => templateLink.id).includes(tagInputInt)
    ) {
      return;
    }

    try {
      const templateLink = await fetchTemplate(tagInputInt);

      onTemplateLinkAdd({ id: templateLink.id, title: templateLink.title });
      setTagInput("");

      setFetchError(false);
    } catch {
      toast.error("Template not found");
      setFetchError(true);
      return;
    }
  };

  const handleTemplateLinkRemove = (templateId: number) => {
    onTemplateLinkRemove(templateId);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add a tag..."
          className={`input input-sm w-full input-bordered ${
            fetchError ? "input-error" : ""
          }`}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />
        <button
          onClick={handleTemplateLinkAdd}
          className="btn btn-sm btn-primary"
          disabled={!tagInput}
          type="button"
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {templateLinks.map((templateLink) => (
          <div key={templateLink.id} className="flex justify-start w-full">
            <button
              onClick={() => handleTemplateLinkRemove(templateLink.id)}
              className="btn btn-ghost justify-between w-full group"
            >
              <div className="group-hover:hidden w-full">
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-3 h-3" />
                  <span>{templateLink.title}</span>
                </div>
              </div>

              <div className="hidden group-hover:flex space-x-2 items-center justify-center text-error w-full">
                <TrashIcon className="w-5 h-5" />
                <span>Remove</span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
