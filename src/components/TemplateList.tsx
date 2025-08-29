"use client";
import TemplateListItem from "@/components/TemplateListItem";
import {useState} from "react";

interface TemplateProps {
  templates: {
    id: number;
    title: string;
    description: string;
    tamplateTags: {
      id: number;
      tag: string;
    }[];
    createdAt: string;
    code: string;
    language: string;
    stdin?: string;
    userId: number;
  }[];
}

function TemplateList({ templates }: TemplateProps) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean[]>([]);

  if (!templates.length) {
    return (
      <div className="container mt-5">
        <p className="text-center font-bold text-base-content">No templates found</p>
      </div>
    );
  }

  const toggleDropdown = (idx: number) => {
    console.log(idx);
    const tmp = (Array(templates.length).fill(false));
    tmp[idx] = !dropdownOpen[idx];
    setDropdownOpen(tmp);
  }

  return (
    <div className="flex-1">
      <div className="grid gap-6">
        {templates.map((template, idx) => (
          <TemplateListItem
            key={template.id}
            id={template.id}
            title={template.title}
            explanation={template.description}
            tags={template.tamplateTags}
            createdAt={template.createdAt}
            content={template.code}
            language={template.language}
            stdin={template.stdin}
            userId={template.userId}
            isDropdown={dropdownOpen[idx]}
            toggleDropdown={() => toggleDropdown(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default TemplateList;
