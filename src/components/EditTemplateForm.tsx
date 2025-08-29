/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from "react";
import TagsInput from "@/components/TagsInput";

interface PopupEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    title: string;
    description: string;
    tags: string[];
  }) => Promise<void>;
  onTitleChange: (e:any) => void;
  onDescriptionChange: (e:any) => void;
  error: string;
  tagsInputProps: {
    tags: string[];
    inputValue: string;
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onClick: (id: number) => void;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  initialData: {
    title: string;
    description: string;
  };
}

const PopupEditForm: FC<PopupEditFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  error,
  tagsInputProps,
  initialData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-base-200 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-base-200 rounded-lg shadow-lg p-8 w-11/12 md:w-1/3 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        {/* Form */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formObject = {
              title: formData.get("title") as string,
              description: formData.get("description") as string,
              tags: tagsInputProps.tags,
            };

            onSubmit(formObject);
          }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Edit Template</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Title */}
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
              value={initialData.title}
              onChange={onTitleChange}
              className="w-full px-3 py-2 border border-base-content/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter Template Title"
              required
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <TagsInput {...tagsInputProps} />
          </div>

          {/* Description */}
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
              value={initialData.description}
              onChange={onDescriptionChange}
              className="w-full px-3 py-2 border border-base-content/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Enter Description"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupEditForm;
