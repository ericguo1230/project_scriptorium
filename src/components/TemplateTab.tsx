"use client";
import React, {useState} from "react";
import RunButton from "@/components/RunButton";
import LanguageDropdown from "@/components/LanguageDropdown";
import { LanguageDropdownProps } from "@/components/LanguageDropdown";
import { useSession } from "@/context/sessionProvider";
import { updateCode, saveCode, getTitle } from "@/app/actions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

async function getTemplateTitle(templateId: number){
  const data = {
    templateId: templateId,
  }
  const response = await getTitle(data)
  if (response.type==="success"){
    return response.title
  }else{
    return "Failed to retrieve templateId"
  }
}

interface TemplateTabProps {
  id?: number;
  languageDropdownProps: LanguageDropdownProps;
  language: string;
  code: string;
  stdin?: string;
  title: string;
  userID?: number;
  onRun: () => void;
  executionStatus?: string;
  forkedFromId?: number;
}

const TemplateTab: React.FC<TemplateTabProps> = ({
  id,
  languageDropdownProps,
  language = "",
  code,
  stdin = "",
  title,
  userID,
  onRun,
  executionStatus,
  forkedFromId,
}) => {
  let isAuth = false;
  const { session } = useSession();
  if (session) {
    isAuth = true;
  }
  const [forkedTitle, setForkedTitle] = useState("")

  if (forkedFromId) {
    const getTitle = async () => {
      const forked = (await getTemplateTitle(forkedFromId)) || "";
      setForkedTitle(forked)
    };
    getTitle();
  }
  console.log(forkedTitle)
  const handleOnClick = async () => {
    if (language === "") {
      toast.error("Invalid Language");
      return;
    }
    if (id && session) {
      let fork = true;
      if (Number(session.id) === userID) {
        fork = false;
      }
      const body = {
        id: id,
        title: title,
        code: code,
        language: language,
        stdin: stdin,
        fork: fork,
      };
      const response = await updateCode(body);
      if (fork && response.type === "error") {
        toast.error("Forked unsuccessfully");
      } else if (fork && response.type === "success") {
        toast.success("Forked successfully, go to templates to see!");
      }else if (response.type === "success"){
        toast.success("Code saved successfully!");
      }else{
        toast.error("Failed to save code.");
      }
      return response;
    } else {
      if (title === "Code Editor") {
        toast.error("Invalid title");
        return;
      }
      const body = {
        code: code,
        stdin: stdin,
        language: language,
        title: title,
      };
      const response = await saveCode(body);
      console.log(response)
      if (response.type === "success") {
        toast.success("Code saved successfully!");
      } else {
        toast.error("Failed to save code.");
      }
      console.log(response);
      return response;
    }
  };

  return (
    <div className="h-full bg-base-100 flex flex-col justify-between items-center py-8">
      {/* Top Section */}
      <div className="flex flex-col items-center">
        {/* Run Button */}
        <div className="mb-16">
          <RunButton onClick={onRun} executionStatus={executionStatus} />
        </div>

        {/* Language Dropdown */}
        <div className="mb-16">
          <LanguageDropdown {...languageDropdownProps} />
        </div>

        {/* Save Button */}
        {isAuth && (
          <div className="mb-16">
            <button className="btn btn-primary" onClick={handleOnClick}>
              SAVE
            </button>
          </div>
        )}
      </div>

      {/* Final Section at Bottom */}
      {forkedFromId && (
        <div className="mb-8">
          <p className="font-mono font-sm text-center text-blue-500">Forked from: {forkedTitle}</p>
        </div>
      )}
    </div>
  );
};

export default TemplateTab;
