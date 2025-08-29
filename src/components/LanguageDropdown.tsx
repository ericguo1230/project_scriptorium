import React from "react";

export interface LanguageDropdownProps {
  onOptionSelect: (selectedOption: string) => void;
  selectedOption: string;
  isOpen: boolean;
  onToggle: ()=> void;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ 
  onOptionSelect,
  selectedOption,
}) => {
  const menuItems = [
    {
      name: "C++",
      value: "cpp"
    },
    {
      name: "C",
      value: "c"
    },
    {
      name: "Java",
      value: "java"
    },
    {
      name: "JavaScript",
      value: "javascript"
    },
    {
      name: "Python",
      value: "python"
    },
    {
      name: "TypeScript",
      value: "typescript"
    },
    {
      name: "Ruby",
      value: "ruby"
    },
    {
      name: "Go",
      value: "go"
    },
    {
      name: "Swift",
      value: "swift"
    },
    {
      name: "Rust",
      value: "rust"
    },
  ]


  return (
    <div className="relative inline-block text-left text-base-content">
      <select className="select select-bordered w-full max-w-xs" onChange={(e) => onOptionSelect(e.target.value)} defaultValue={selectedOption || undefined}>
        <option disabled selected>Select language</option>
        {menuItems.map(({name, value}) => (
          <option key={name} value={value}>
            {name}
          </option>
        ))}
      </select>    
    </div>
  );
};

export default LanguageDropdown;
