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

  const handleEditorMount = (editor, monaco) => {
    // editor.onDidPaste(() => {
    //   alert("Did you paste something?\nDon't forget to cite it!");
      
    //   const model = editor.getModel();
    //   const selection = editor.getSelection();
    //   const pastedText = editor.getModel().getValueInRange(selection);

    //   const payload = {
    //     text: pastedText,
    //     startLine: selection.startLineNumber,
    //     endLine: selection.endLineNumber,
    //   };

    //   // send to backend
    //   fetch("http://127.0.0.1:8000/paste-log", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   }).catch((err) => console.error("Paste sync failed", err));
    // });
    editor.onDidChangeModelContent((event) => {
      for (const change of event.changes) {
        if (change.text.length > 1 || change.text.includes("\n")) {
          // Likely a paste (multi-char or multi-line)
          const startLine = change.range.startLineNumber;
          const endLine = change.range.endLineNumber + (change.text.match(/\n/g)?.length || 0);
          const pastedText = change.text;
    
          alert("Gotcha 🚨");
    
          fetch("http://127.0.0.1:8000/paste-log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: pastedText,
              startLine: startLine,
              endLine: endLine,
            }),
          });
        }
      }
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