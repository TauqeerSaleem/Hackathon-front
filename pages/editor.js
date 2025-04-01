import { useState } from "react";
import Editor from "@monaco-editor/react";
import debounce from "lodash.debounce";

export default function CodeEditorPage() {
  const [code, setCode] = useState("");

  const syncToBackend = debounce(async (value) => {
    try {
      if (!value || typeof value !== "string") {
        console.warn("Skipping sync: invalid value", value);
        return;
      }
  
      console.log("Syncing to backend with:", value);
  
      const res = await fetch("http://127.0.0.1:8000/update-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
  
      if (!res.ok) {
        console.error("Backend responded with error:", res.status);
      }
    } catch (error) {
      console.error("Network sync failed:", error);
    }
  }, 500);
  

  const handleEditorChange = (value) => {
    setCode(value);
    if (!value) return;
    syncToBackend(value)
  };

  const handleEditorMount = (editor) => {
    let lastPasteRange = null;

    // Track last change range
    editor.onDidChangeModelContent((event) => {
      const fullRange = event.changes[0]?.range;
      if (fullRange && event.changes.length === 1) {
        lastPasteRange = fullRange;
      }
    });

    editor.onDidPaste(() => {
      setTimeout(() => {
        if (!lastPasteRange) return;
    
        const model = editor.getModel();
    
        const startLine = lastPasteRange.startLineNumber;
        const endLine = lastPasteRange.endLineNumber + (model.getLineCount() > lastPasteRange.endLineNumber ? 0 : 1);
    
        // Grab actual pasted lines
        const pastedLines = model.getLinesContent().slice(startLine - 1, endLine);
        const pastedText = pastedLines.join("\n");
    
        if (!pastedText.trim()) return;
    
        const source = prompt("You just pasted some code. Please enter the source or citation:");
    
        fetch("http://127.0.0.1:8000/paste-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: pastedText,
            startLine: startLine,
            endLine: endLine,
            source: source || "No source provided",
          }),
        });
    
        lastPasteRange = null; // reset after sending
      }, 50); // delay for Monaco to finish applying paste
    });    
  };
  
  return (
    <div className="min-h-screen bg-black-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Code Editor</h1>
      
      <div className="rounded border border-gray-300 overflow-hidden">
        <Editor
          height="85vh"
          defaultLanguage="python"
          defaultValue={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          onMount={handleEditorMount}
        />
      </div>
    </div>
  );
}