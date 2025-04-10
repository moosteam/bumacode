import React from "react";
import Editor from "@monaco-editor/react";

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
}

const CodeInput: React.FC<CodeInputProps> = ({
  code,
  setCode,
  language,
}) => {
  const handleEditorDidMount = (editor: any) => {
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const getMonacoLanguage = (lang: string) => {
    const monacoLangMap: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'csharp': 'csharp',
      'cpp': 'cpp',
      'c': 'cpp',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'markdown': 'markdown',
      'go': 'go',
      'rust': 'rust',
      'xml': 'xml',
      'yaml': 'yaml',
    };
    return monacoLangMap[lang] || 'plaintext';
  };

  const editorOptions = {
    fontSize: 14,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    lineNumbers: "on",
    scrollbar: {
      vertical: "visible",
      horizontal: "visible",
    },
    wordWrap: "on",
    wrappingIndent: "same",
    semanticHighlighting: false,
    formatOnPaste: true,
    formatOnType: true,
    renderValidationDecorations: "off",
    snippetSuggestions: "none",
    suggest: { 
      snippetsPreventQuickSuggestions: true 
    },
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50">
      <Editor
        height="500px"
        width="100%"
        defaultLanguage="javascript"
        language={getMonacoLanguage(language)}
        value={code}
        onChange={handleCodeChange}
        onMount={handleEditorDidMount}
        options={editorOptions}
        className="w-full"
      />
    </div>
  );
};

export default CodeInput;