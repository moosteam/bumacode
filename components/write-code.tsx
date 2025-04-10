import React from "react";
import CodeHighlighter from "@/components/highlight";

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  lineNumbers: string[];
  handleTabKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  codeEditorRef: React.RefObject<HTMLTextAreaElement>;
}

const CodeInput: React.FC<CodeInputProps> = ({
  code,
  setCode,
  lineNumbers,
  handleTabKey,
  handleScroll,
  codeEditorRef,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50">
      <div className="flex min-h-[300px] max-h-[600px]">
        <div className="bg-gray-100 text-gray-500 p-4 text-right select-none font-mono text-sm sticky top-0">
          {lineNumbers.map((num, i) => (
            <div key={i}>{num}</div>
          ))}
        </div>

        <div className="relative flex-grow h-full">
          <textarea
            ref={codeEditorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleTabKey}
            onScroll={handleScroll}
            className="p-4 font-mono text-sm resize-none w-full h-full outline-none bg-transparent text-transparent caret-gray-800 absolute top-0 left-0 z-10"
            placeholder="여기에 코드를 입력하세요..."
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
          />
          <div className="p-4 h-full overflow-auto">
            <CodeHighlighter code={code} language="javascript" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeInput;