/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Layout, Model, TabNode } from "flexlayout-react";
import CodeEditor from '@uiw/react-textarea-code-editor';
import TemplateTab from "@/components/TemplateTab";
import handleTabText from "@/lib/handleTabText";
import "flexlayout-react/style/light.css";
import { executeCode } from "@/app/actions";
import { toast } from "react-toastify";
import TemplateBlogPostsTab from "./TemplateBlogPostsTab";

const CodeEditorMain: React.FC<{ 
  placeholder?: string; 
  code?: string;  
  language?: string;
  onChange: (e:any) => void; 
}> = ({
  placeholder = "Write your code here...",
  code= "",
  language,
  onChange,
}) => (
  <div className="min-h-screen w-full bg-base-100 border boder-base-200 rounded-md shadow-sm text-base-content">
    <CodeEditor
      placeholder={placeholder}
      language={language}
      onChange={onChange}
      onKeyDown={handleTabText}
      padding={15}
      value={code}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        color: "var(--tw-text-primary-content)",
        overflow: "auto",
        whiteSpace: "pre",
        fontSize: "1rem",
        wordWrap:"break-word",
        fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace",
      }}
    />
  </div>
);

const StdinEditor: React.FC<{ 
  stdin?: string;
  onChange: (e:any) => void; 
}> = ({
  stdin="",
  onChange,
}) => (
  <div className="h-full w-full bg-base-100 border border-base-200 rounded-md shadow-sm">
    <textarea
      className="w-full h-full bg-transparent text-base-content border-none outline-none resize-none font-mono p-4"
      placeholder="Enter standard input (stdin)..."
      defaultValue={stdin}
      onChange={onChange}
      onKeyDown={handleTabText}
    ></textarea>
  </div>
);

const ConsoleOutput: React.FC <{ output?:string }>= ({
  output="Console output will appear here..."
}) => (
  <div className="h-full w-full bg-info-content text-white border border-gray-800 rounded-md shadow-sm p-4 overflow-auto font-mono">
    <pre className="whitespace-pre-wrap">
      {output}
    </pre>
  </div>
);

interface CodeEditorProps{
  code?: string,
  stdin?: string,
  title?: string,
  language?: string,
  userID?: number,
  id?: number,
  isForked?: boolean,
  forkedFromId?: number,
}

const CodeExecutor: React.FC<CodeEditorProps> = ({
  id,
  code = "",
  stdin = "",
  title = "Code Editor",
  language = "",
  userID,
  isForked,
  forkedFromId,
}) => {
  const [currentCode, setCode] = useState(code);
  const [currentStdIn, setStdIn] = useState(stdin);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [tabTitle, setTabTitle] = useState(title); // State to store the tab title
  const [consoleOutput, setConsoleOutput] = useState("Console output will appear here...")
  const [executionStatus, setExecutionStatus] = useState("")

  const layoutConfig = {
    global: {
      tabEnableDrag: true,
      tabSetEnableDrop: true,
      tabEnableClose: false,
      tabEnableRename: true, // Enable renaming
      tabSetMaximize: true,
      tabSetEnableTabStrip: true,
      tabClassName: "font-mono",
    },
    layout: {
      type: "row",
      weight: 100,
      children: [
        {
          type: "tabset",
          weight: 10,
          enableMaximize: false,
          enableTabStrip: false,
          enableDrop: false,
          children: [
            {
              type: "tab",
              component: "TemplateTab",
              enableDrag: false,
            },
          ],
        },
        {
          type: "column",
          weight: 50,
          children: [
            {
              type: "tabset",
              weight: 80,
              children: [
                {
                  type: "tab",
                  name: tabTitle,
                  component: "CodeEditorMain",
                  enableRename: true,
                },
                {
                  type: "tab",
                  name: "Template Blog Posts",
                  component: "TemplateBlogTab",
                }
              ],
            },
            {
              type: "tabset",
              weight: 20,
              children: [
                {
                  type: "tab",
                  name: "Stdin",
                  component: "StdinEditor",
                },
              ],
            },
          ],
        },
        {
          type: "tabset",
          weight: 40,
          children: [
            {
              type: "tab",
              name: "Console Output",
              component: "ConsoleOutput",
            },
          ],
        },
      ],
    },
  };

  const [model] = useState(Model.fromJson(layoutConfig));
  const onRun = async() => {
    if (selectedLanguage === ""){
      toast.error("Select a language")
      return
    }
    const data = {
      code: currentCode,
      stdin: currentStdIn,
      language: selectedLanguage as "python" | "javascript" | "java" | "c" | "cpp",
    }
    setExecutionStatus("executing")
    const response = await executeCode(data)
    setExecutionStatus("finished")

    if (response.type==="success"){
      toast.success("Executed Code")
    }else{
      toast.error("Error executing code")
    }
    if (response.stdout === ""){
      setConsoleOutput(response.stderr)
    }else{
      setConsoleOutput(response.stdout ?? "Console output will appear here...")
    }
  }

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    if (component === "CodeEditorMain") {
      return (
        <CodeEditorMain
          code={currentCode}
          language={selectedLanguage}
          onChange={(evn) => setCode(evn.target.value)}
        />
      );
    } else if (component === "StdinEditor") {
      return (
        <StdinEditor
          stdin={currentStdIn}
          onChange={(e) => setStdIn(e.target.value)}
        />
      );
    } else if (component === "ConsoleOutput") {
      return <ConsoleOutput 
      output={consoleOutput}
      />;
    } else if (component === "TemplateTab") {
      return (
        <TemplateTab
          id={id}
          title={tabTitle}
          language={selectedLanguage}
          code={currentCode}
          stdin={currentStdIn}
          userID={userID}
          executionStatus={executionStatus}
          onRun={onRun}
          forkedFromId={isForked ? forkedFromId : undefined}
          languageDropdownProps={{
            onOptionSelect: handleLanguageSelect,
            selectedOption: selectedLanguage,
            isOpen: isDropdownOpen,
            onToggle: toggleDropdown,
          }}
        />
      );
    } else if (component === "TemplateBlogTab") {
      return (
        <TemplateBlogPostsTab templateId={id} />
      )
    }
    return null;
  };

  const handleLanguageSelect = (item: string) => {
    let formattedLanguage = item;
    if (item === "C++") {
      formattedLanguage = "cpp";
    } else if (item === "JavaScript") {
      formattedLanguage = "js";
    } else {
      formattedLanguage = item.toLowerCase();
    }
    setSelectedLanguage(formattedLanguage);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  const onAction = (action: any) => {
    if (action.type === "FlexLayout_RenameTab") {
      const { text } = action.data; 
  
      if (text.trim() === "") {
        alert("Tab name cannot be empty.");
        return undefined; 
      }

      if (text.length > 20) {
        alert("Tab name cannot exceed 20 characters.");
        return undefined;
      }

      action.data.text = text.trim();
      setTabTitle(action.data.text)
    }
  
    return action; 
  };
  

  return (
    <div className="h-full w-full">
      <Layout model={model} factory={factory} onAction={onAction} />
    </div>
  );
};

export default CodeExecutor;
