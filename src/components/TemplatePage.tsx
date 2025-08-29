/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, Suspense  } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import TemplateList from "@/components/TemplateList";
import TemplateFilter from "@/components/TemplateFilter";
import Pagination from "@/components/Pagination";
import PopupForm from "@/components/CreateTemplateForm";
import { createTemplate } from "@/app/actions";
import { useSession } from "@/context/sessionProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function TemplatesSection({
  responseData,
}: {
  responseData: any;
}) {
  return (
    <>
      <TemplateList templates={responseData.data} />
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

export default function TemplatePage(props: {
  responseData: any; 
  searchParams?: Record<string, string>;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string>("");
  const { session } = useSession();
  

  const router = useRouter();

  useEffect(() => {
    if (isPopupOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Clean up on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPopupOpen]);

  //check if form is filled
  const validateForm = (formObject: {
    name: string;
    tags: string[];
    language: string;
    description: string;
  }): string => {
    if (!formObject.name.trim()) return "Title is required.";
    if (!formObject.language.trim()) return "Language is required.";
    return "";
  };

  //language select menu for create template form
  const handleLanguageSelect = (item: string) => {
    setSelectedLanguage(item);
    setDropdownOpen(false);
    setError("");
  };

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  const handleCreateTemplate = async (formData: {
    name: string;
    tags: string[];
    language: string;
    description: string;
  }) => {
    const validate = validateForm(formData);
    if (validate !== ""){
      setError(validate)
      return
    }
    if (session){
      const result = await createTemplate(formData);
      if (result.type === "success") {
        setIsPopupOpen(false);
        resetForm(); 
        router.refresh();
      }
    }else{
      setError("You must be logged in to create a template")
    }
  };

  // Function to reset the form
  function resetForm(){
    setTags([]); 
    setInputValue(""); 
    setSelectedLanguage(""); 
    setError(""); 
    setDropdownOpen(false);
  };

  //tags in form
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      event.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="container mt-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="btn btn-primary"
            disabled={!session}
          >
            <PlusIcon className="w-6 h-6" />
            {session ? "Create Template" : "Login to create template"}
          </button>
          <TemplateFilter 
          />
        </div>
        <div className="flex-1">
          {props.responseData && (
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              }
            >
              <TemplatesSection responseData={props.responseData} />
            </Suspense>
          )}
        </div>
      </div>
      <PopupForm
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false)
          resetForm()
        }}
        onSubmit={handleCreateTemplate}
        error={error}
        languageDropdownProps={{
          onOptionSelect: handleLanguageSelect,
          selectedOption: selectedLanguage,
          isOpen: isDropdownOpen,
          onToggle: toggleDropdown,
        }}
        tagsInputProps={{
          tags: tags,
          inputValue: inputValue,
          onKeyDown: handleTagKeyDown,
          onClick: handleRemoveTag,
          onChange: handleTagChange,
        }}
      />
    </div>
  );
}
