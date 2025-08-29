import React from "react";
const handleTabText = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Prevent default tab behavior
      const textarea = e.target as HTMLTextAreaElement;
  
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
  
      // Insert tab character
      const value = textarea.value;
      textarea.value = value.substring(0, start) + "\t" + value.substring(end);
  
      // Move cursor to the right of the tab character
      textarea.selectionStart = textarea.selectionEnd = start + 1;
    }
  };
  export default handleTabText;