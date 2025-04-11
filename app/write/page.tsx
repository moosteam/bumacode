"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import JSZip from "jszip";
import dynamic from 'next/dynamic';
import FileTree, { type FileNode } from "@/components/file-tree";
import Header from "@/components/layout/header";
import {
  detectLanguage,
  detectLanguageFromExtension,
  languageDisplayNames
} from "@/components/highlight";
import WriteButton from "@/components/ui/wirte-button";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => null
});

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("// 여기에 코드를 입력하세요.");
  const [language, setLanguage] = useState("javascript");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isZipMode, setIsZipMode] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [originalZipFile, setOriginalZipFile] = useState<File | Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);

  const getDescriptionFromCode = () => {
    if (!code) return "";
    const firstLine = code.split("\n")[0].trim();
    return firstLine
      .replace(/^\/\/\s*/, "")
      .replace(/^#\s*/, "")
      .replace(/^\/\*\s*/, "")
      .replace(/\*\/\s*$/, "");
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setEditorReady(true);
  };

  const createFileTree = async (zip: JSZip): Promise<FileNode> => {
    const root: FileNode = {
      name: "root",
      path: "",
      type: "directory",
      children: []
    };

    const promises: Promise<void>[] = [];

    zip.forEach((path, zipEntry) => {
      if (path.startsWith("__MACOSX/") || path.split("/").some((part) => part.startsWith("."))) {
        return;
      }

      const pathParts = path.split("/");
      if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === "")) {
        return;
      }

      if (zipEntry.dir) {
        addDirectoryToTree(root, pathParts);
      } else {
        const promise = zipEntry.async("string").then((content) => {
          const fileNode = addFileToTree(root, pathParts);
          if (fileNode) {
            fileNode.content = content;
            fileNode.language = detectLanguageFromExtension(path);
          }
        });
        promises.push(promise);
      }
    });

    await Promise.all(promises);

    if (root.children && root.children.length === 1 && root.children[0].type === "directory") {
      return root.children[0];
    }

    return root;
  };

  const addDirectoryToTree = (root: FileNode, pathParts: string[]): FileNode => {
    let current = root;
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (!part) continue;
      if (!current.children) current.children = [];
      let found = current.children.find((child) => child.name === part);
      if (!found) {
        const newPath = current.path ? `${current.path}/${part}` : part;
        const newNode: FileNode = { name: part, path: newPath, type: "directory", children: [] };
        current.children.push(newNode);
        found = newNode;
      }
      current = found;
    }
    return current;
  };

  const addFileToTree = (root: FileNode, pathParts: string[]): FileNode | null => {
    if (pathParts.length === 0) return null;
    const fileName = pathParts[pathParts.length - 1];
    if (!fileName) return null;
    let current = root;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!part) continue;
      if (!current.children) current.children = [];
      let found = current.children.find((child) => child.name === part);
      if (!found) {
        const newPath = current.path ? `${current.path}/${part}` : part;
        const newNode: FileNode = { name: part, path: newPath, type: "directory", children: [] };
        current.children.push(newNode);
        found = newNode;
      }
      current = found;
    }
    if (!current.children) current.children = [];
    let fileNode = current.children.find((child) => child.name === fileName);
    if (!fileNode) {
      const filePath = current.path ? `${current.path}/${fileName}` : fileName;
      fileNode = { name: fileName, path: filePath, type: "file" };
      current.children.push(fileNode);
    }
    return fileNode;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setTitle(file.name.split(".").slice(0, -1).join("."));
    setIsLoading(true);

    if (file.name.toLowerCase().endsWith(".zip")) {
      try {
        setOriginalZipFile(file);
        const zipData = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(zipData);
        const tree = await createFileTree(zip);
        setFileTree(tree);
        setIsZipMode(true);
        const firstFile = findFirstFile(tree);
        if (firstFile) {
          setSelectedFile(firstFile);
          setCode(firstFile.content || "");
        }
      } catch (error) {
        console.error("ZIP 파일 처리 중 오류:", error);
        alert("ZIP 파일을 처리하는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsZipMode(false);
      setFileTree(null);
      setSelectedFile(null);
      setOriginalZipFile(null);
      const detectedLang = detectLanguageFromExtension(file.name);
      setLanguage(detectedLang);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCode(content);
        setIsLoading(false);
      };
      reader.readAsText(file);
    }
  };

  const findFirstFile = (node: FileNode): FileNode | null => {
    if (node.type === "file") return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findFirstFile(child);
        if (found) return found;
      }
    }
    return null;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (!fileName && !isZipMode && code) {
      const detectedLang = detectLanguage(code);
      setLanguage(detectedLang);
    }

    if (isZipMode && selectedFile && selectedFile.content !== code) {
      const updateContentInTree = (node: FileNode): boolean => {
        if (node === selectedFile) {
          node.content = code;
          node.language = language;
          return true;
        }
        if (node.children) {
          for (const child of node.children) {
            if (updateContentInTree(child)) return true;
          }
        }
        return false;
      };
      if (fileTree) {
        updateContentInTree(fileTree);
      }
    }
  }, [code, language, fileName, isZipMode, selectedFile, fileTree]);

  const handleSubmit = () => {
    const description = getDescriptionFromCode();

    if (isZipMode) {
      console.log("ZIP Mode Submit Data:", { title, description, fileTree, originalZipFile });
    } else {
      console.log("Single File Mode Submit Data:", { title, description, code, language, fileName });
    }
  };

  const handleSelectFile = (node: FileNode) => {
    if (node.type === "file") {
      setSelectedFile(node);
      setCode(node.content || "");
      setLanguage(node.language || detectLanguageFromExtension(node.name));
      setFileName(node.name);
    }
  };

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = "auto";
      titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`;
    }
  }, [title]);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const editorOptions = {
    fontSize: 14,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    lineNumbers: "on",
    scrollbar: {
      vertical: "visible",
      horizontal: "visible"
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

  // 렌더링 컨테이너 - 자리를 항상 유지
  const renderEditorContainer = () => {
    const zipHeight = "700px";
    const singleHeight = "410px";
    
    if (isZipMode) {
      return (
        <div className="rounded-lg overflow-hidden" style={{ height: zipHeight }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <h1 className="text-2xl font-bold">잠시만 기다려주세요...</h1>
            </div>
          ) : (
            <>
              <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                <div className="text-sm font-medium flex items-center">
                  <span>{fileTree?.name !== "root" ? fileTree?.name : "코드"}</span>
                </div>
              </div>

              <div className="flex" style={{ height: "calc(100% - 40px)" }}>
                <div className="w-1/4 border-r overflow-y-auto bg-gray-50 hide-scrollbar p-2">
                  {fileTree && <FileTree root={fileTree} onSelectFile={handleSelectFile} />}
                </div>

                <div className="w-3/4 flex flex-col overflow-hidden ml-[-20px]">
                  {selectedFile ? (
                    <div className="h-full w-full">
                      <Editor
                        height="100%"
                        width="100%"
                        language={language}
                        value={code}
                        onChange={handleCodeChange}
                        onMount={handleEditorDidMount}
                        options={editorOptions}
                        loading={null}
                        className="w-full bg-transparent"
                      />
                    </div>
                  ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-500">
                      표시할 파일을 선택하세요.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      );
    } else {
      return (
        <div className="rounded-lg overflow-hidden" style={{ height: singleHeight }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <h1 className="text-2xl font-bold">잠시만 기다려주세요...</h1>
            </div>
          ) : (
            <div className="h-full ml-[-20px]">
              <Editor
                height="100%"
                width="100%"
                defaultLanguage="javascript"
                language={language}
                value={code}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
                options={editorOptions}
                loading={null}
                className="w-full bg-transparent"
              />
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-2">
            <textarea
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold border-none outline-none resize-none overflow-hidden"
              placeholder="제목을 입력하세요."
              rows={1}
              required
            />
            <div className="text-sm text-gray-400 mt-1">
              작성 중인 사용자 IP · 210.11.⚹⚹⚹.⚹⚹
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-end items-center mb-8 mt-[-30]" style={{ marginTop: "-34px" }}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="text-sm text-blue-500 flex items-center gap-1"
                >
                  <Upload size={14} />
                  <span>파일 업로드</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".*"
                />
              </div>
            </div>

            {renderEditorContainer()}
          </div>

          <div className="flex justify-end">
            <WriteButton onClick={handleSubmit} />
          </div>
        </form>
      </div>
    </main>
  );
}