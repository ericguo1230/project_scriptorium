import React, { FC } from "react";
import LanguageDropdown, { LanguageDropdownProps } from "@/components/LanguageDropdown";
import TagsInput, { TagsInputProps } from "@/components/TagsInput";

interface PopupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    tags: string[];
    language: string;
    description: string;
  }) => Promise<void>;
  error: string;
  languageDropdownProps: LanguageDropdownProps;
  tagsInputProps: TagsInputProps;
}

const PopupForm: FC<PopupFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  error,
  languageDropdownProps,
  tagsInputProps,
}) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-base-200 rounded-lg shadow-lg p-8 w-11/12 md:w-1/3 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-base-content hover:text-gray-700"
        >
          ✖
        </button>

        {/* Form */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formObject = {
              name: formData.get("title") as string,
              tags: tagsInputProps.tags,
              language: languageDropdownProps.selectedOption,
              description: formData.get("description") as string,
            };

            onSubmit(formObject);
          }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Create Template</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label
              className="block text-base-content font-bold mb-2"
              htmlFor="title"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full px-3 py-2 border border-base-content/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter Code Template Title"
              required
            />
          </div>
          <div className="mb-4">
            {/* TagsInput */}
            <TagsInput {...tagsInputProps} />
          </div>
          <div className="mb-4">
            <label
              className="block text-base-content font-bold mb-2"
              htmlFor="language"
            >
              Language
            </label>
            <LanguageDropdown {...languageDropdownProps} />
          </div>
          <div className="mb-4">
            <label
              className="block text-base-content font-bold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="w-full px-3 py-2 border border-base-content/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Description"
              rows={2}
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupForm;
