"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, FileCode, Folder, Copy, Check, Download } from "lucide-react";
import JSZip from "jszip";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import FileTree, { type FileNode } from "@/components/file-tree";
import Header from "@/components/layout/header";
import {
  detectLanguage,
  detectLanguageFromExtension,
  languageDisplayNames,
} from "@/components/highlight";
import WriteButton from "@/components/ui/wirte-button";

const LoadingEditor = ({ isZip }: { isZip?: boolean }) => {
  return (
    <div className="absolute inset-0 bg-white" style={{ height: isZip ? 'calc(100vh - 280px)' : 'calc(100vh - 380px)' }}>
      <div className="w-full h-full bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
};

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <LoadingEditor />
});

export default function WritePage() {
  const router = useRouter();
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
  const [userIp, setUserIp] = useState<string>("");
  const [isIpLoading, setIsIpLoading] = useState(true);
  
  const [lineCount, setLineCount] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  
  const [editorHeight, setEditorHeight] = useState({
    zip: "calc(100vh - 260px)",
    single: "calc(100vh - 360px)"
  });

  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    code?: string;
  }>({});

  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);

  const [isBinaryFile, setIsBinaryFile] = useState(false);
  const [binaryFileInfo, setBinaryFileInfo] = useState<{
    size: number;
    type: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [zipCopied, setZipCopied] = useState(false);

  const CodeEditorLoadingSkeleton = () => (
    <div className="h-full bg-white p-3" style={{ height: isZipMode ? editorHeight.zip : editorHeight.single }}>
      <div className="h-full bg-gray-200 rounded animate-pulse"></div>
    </div>
  );

  useEffect(() => {
    const updateEditorHeight = () => {
      setEditorHeight({
        zip: `calc(100vh - 260px)`,
        single: `calc(100vh - 360px)`
      });
    };

    updateEditorHeight();
    window.addEventListener('resize', updateEditorHeight);
    return () => window.removeEventListener('resize', updateEditorHeight);
  }, []);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        const ip: string = data.ip;
        const parts = ip.split(".");
        const maskedIP =
          parts.length === 4
            ? `${parts[0]}.${parts[1]}.${"⚹".repeat(parts[2].length)}.${"⚹".repeat(parts[3].length)}`
            : ip;
        setUserIp(maskedIP);
      } catch (err) {
        console.error("IP fetch error:", err);
        setUserIp("알수없음");
      } finally {
        setIsIpLoading(false);
      }
    };
    fetchIP();
  }, []);

  useEffect(() => {
    if (code) {
      setLineCount(code.split('\n').length);
      setFileSize(new TextEncoder().encode(code).length);
    }
  }, [code]);

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
      children: [],
      length: 0,
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
        const newNode: FileNode = {
          name: part,
          path: newPath,
          type: "directory",
          children: [],
          length: 0,
        };
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
        const newNode: FileNode = {
          name: part,
          path: newPath,
          type: "directory",
          children: [],
          length: 0,
        };
        current.children.push(newNode);
        found = newNode;
      }
      current = found;
    }
    if (!current.children) current.children = [];
    let fileNode = current.children.find((child) => child.name === fileName);
    if (!fileNode) {
      const filePath = current.path ? `${current.path}/${fileName}` : fileName;
      fileNode = { name: fileName, path: filePath, type: "file", length: 0 };
      current.children.push(fileNode);
    }
    return fileNode;
  };

  const isBinaryFileType = (fileName: string): boolean => {
    const binaryExtensions = [
      '.unitypackage', '.xlsx', '.xls', '.doc', '.docx', '.pdf', 
      '.rar', '.7z', '.exe', '.dll', '.so', '.dylib',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
      '.mp3', '.mp4', '.wav', '.avi', '.mov', '.wmv',
      '.psd', '.ai', '.sketch'
    ];
    const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    return binaryExtensions.includes(ext);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setTitle(file.name.split(".").slice(0, -1).join("."));
    setIsLoading(true);

    if (isBinaryFileType(file.name)) {
      setIsBinaryFile(true);
      setBinaryFileInfo({
        size: file.size,
        type: file.type || 'application/octet-stream'
      });
      setCode("");
      setIsLoading(false);
      return;
    }

    setIsBinaryFile(false);
    setBinaryFileInfo(null);

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
          if (firstFile.content) {
            setLineCount(firstFile.content.split('\n').length);
            setFileSize(new TextEncoder().encode(firstFile.content).length);
          }
        } else {
          setSelectedFile(null);
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
        setLineCount(content.split('\n').length);
        setFileSize(new TextEncoder().encode(content).length);
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

  const handleSubmit = async () => {
    const errors: { title?: string; code?: string } = {};
    
    if (!title.trim()) {
      errors.title = "*제목을 입력해주세요.";
    }
    if (!isZipMode && !isBinaryFile && !code.trim()) {
      errors.code = "*코드를 입력해주세요.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      
      if (isZipMode) {
        if (originalZipFile instanceof File) {
          const zip = new JSZip();
          
          const addFilesToZip = (node: FileNode, currentPath: string = '') => {
            if (node.name === 'root' && node.children) {
              node.children.forEach(child => {
                addFilesToZip(child, currentPath);
              });
              return;
            }
            
            if (node.type === 'file') {
              const content = node === selectedFile ? code : node.content || '';
              zip.file(currentPath + node.name, content);
            } else if (node.children) {
              node.children.forEach(child => {
                addFilesToZip(child, currentPath + node.name + '/');
              });
            }
          };
          
          if (fileTree) {
            addFilesToZip(fileTree);
          }
          
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const newZipFile = new File([zipBlob], originalZipFile.name, { type: 'application/zip' });
          
          formData.append('file', newZipFile);
        }
      } else {
        formData.append('code', code);
        if (fileName && !isBinaryFile) {
          const file = new File([code], fileName, { type: 'text/plain' });
          formData.append('file', file);
        }
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/write`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || '서버 오류가 발생했습니다.');
      }

      router.push("/");
    } catch (error) {
      console.error('Error submitting:', error);
      alert(error instanceof Error ? error.message : '제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };  

  const handleSelectFile = (node: FileNode) => {
    if (node.type === "file") {
      setSelectedFile(node);
      setCode(node.content || "");
      setLanguage(node.language || detectLanguageFromExtension(node.name));
      setFileName(node.name);
      
      if (node.content) {
        setLineCount(node.content.split('\n').length);
        setFileSize(new TextEncoder().encode(node.content).length);
      }
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

  const getLanguageDisplay = (lang: string): string => {
    return languageDisplayNames[lang] || lang;
  };

  const editorOptions = {
    fontSize: 12,
    fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    lineNumbers: "on",
    lineNumbersMinChars: 3,
    scrollbar: { 
      vertical: 'visible', 
      horizontal: 'visible',
      verticalScrollbarSize: 6,
      horizontalScrollbarSize: 6,
      verticalSliderSize: 6,
      horizontalSliderSize: 6
    },
    wordWrap: "on",
    wrappingIndent: "same",
    renderValidationDecorations: "off",
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    folding: true,
    renderLineHighlight: "line",
    lineHeight: 20,
    padding: { top: 12, bottom: 12 },
    scrollBeyondLastColumn: 0,
    glyphMargin: false,
    fixedOverflowWidgets: true,
    renderWhitespace: "none",
    colorDecorators: true,
    contextmenu: false,
    matchBrackets: "never",
    occurrencesHighlight: "off",
    renderIndentGuides: false,
    selectionHighlight: false,
    lineDecorationsWidth: 0
  };

  const slocCount = code.split('\n').filter(line => line.trim().length > 0).length;

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleZipCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setZipCopied(true);
      setTimeout(() => setZipCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    if (selectedFile && code) {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadZip = () => {
    if (originalZipFile) {
      const url = URL.createObjectURL(originalZipFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'archive.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const renderEditorContainer = () => {
    if (isBinaryFile && binaryFileInfo) {
      return (
        <div className="border rounded-lg overflow-hidden bg-white code-viewer-container relative" style={{ height: editorHeight.single }}>
          <div className="flex items-center justify-center h-full flex-col p-8">
            <FileCode size={48} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{fileName}</h3>
            <div className="text-gray-500 text-sm">
              <p>파일 크기: {formatFileSize(binaryFileInfo.size)}</p>
              <p>파일 형식: {binaryFileInfo.type}</p>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              이 파일은 바이너리 파일이므로 미리보기를 제공하지 않습니다.
            </p>
          </div>
        </div>
      );
    }

    if (isZipMode) {
      return (
        <div className="border rounded-lg overflow-hidden bg-white code-viewer-container relative" style={{ height: editorHeight.zip }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <h1 className="text-2xl font-bold">잠시만 기다려주세요...</h1>
            </div>
          ) : (
            <>
              <div 
                className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
                style={{ height: '40px' }}
              >
                <div className="flex items-center h-full">
                  <Folder size={16} className="mr-2 text-gray-500" />
                  <span className="font-semibold text-sm">코드</span>
                  {!selectedFile && (
                    <span className="ml-4 text-gray-500 text-xs">
                      {formatFileSize(fileSize)}
                    </span>
                  )}
                  {selectedFile && selectedFile.type === "file" && (
                    <span className="ml-4 flex items-center">
                      <span className="text-black font-medium text-xs">{selectedFile.name}</span>
                      <span className="text-gray-500 text-xs">  · {lineCount} Lines ({slocCount} sloc) · {formatFileSize(fileSize)}</span>
                    </span>
                  )}
                </div>

              </div>
              <div className="flex relative" style={{ height: 'calc(100% - 40px)' }}>
                <div className="w-1/5 border-r overflow-y-auto bg-white custom-scrollbar" style={{ borderRight: '0.5px solid #E5E5E5' }}>
                  {fileTree && <FileTree root={fileTree} onSelectFile={handleSelectFile} />}
                </div>
                <div className="w-4/5 relative" style={{ paddingLeft: '2px' }}>
                  {selectedFile ? (
                    <div className="h-full relative">
                      <div className="relative" style={{ height: '100%' }}>
                        <Editor
                          height="100%"
                          width="100%"
                          language={language}
                          value={code}
                          onChange={handleCodeChange}
                          onMount={handleEditorDidMount}
                          options={editorOptions}
                          loading={<LoadingEditor isZip />}
                          className="w-full h-full bg-transparent"
                        />
                      </div>
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
        <div className="border rounded-lg overflow-hidden bg-white code-viewer-container relative" style={{ height: editorHeight.single }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <h1 className="text-2xl font-bold">잠시만 기다려주세요...</h1>
            </div>
          ) : (
            <>
              <div 
                className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
                style={{ height: '40px' }}
              >
                <div className="flex items-center">
                  <FileCode size={16} className="mr-2 text-gray-500" />
                  <span className="font-semibold text-sm">
                    {fileName 
                      ? getLanguageDisplay(detectLanguageFromExtension(fileName) || 'plaintext')
                      : getLanguageDisplay(language)}
                  </span>
                  <span className="ml-4 text-xs text-gray-600">
                    {lineCount} Lines ({slocCount} sloc) · {formatFileSize(fileSize)}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="text-xs flex items-center">
                    <button 
                      className="flex items-center gap-1.5 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
                      onClick={handleCopyCode}
                    >
                      {copied ? <Check size={14} className="text-gray-600" /> : <Copy size={14} />}
                      <span>{copied ? "복사됨" : "복사"}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative" style={{ height: 'calc(100% - 40px)' }}>
                <Editor
                  height="100%"
                  width="100%"
                  language={language}
                  value={code}
                  onChange={handleCodeChange}
                  onMount={handleEditorDidMount}
                  options={editorOptions}
                  loading={<LoadingEditor />}
                  className="w-full h-full bg-transparent"
                />
              </div>
            </>
          )}
        </div>
      );
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mb-8"
        >
          <div className="mb-2">
            <textarea
              ref={titleInputRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationErrors.title) {
                  setValidationErrors(prev => ({ ...prev, title: undefined }));
                }
              }}
              className={`w-full text-4xl font-bold border-none outline-none resize-none overflow-hidden ${
                validationErrors.title ? 'border-b-2 border-red-500' : ''
              }`}
              placeholder="제목을 입력하세요."
              rows={1}
              required
            />
            {validationErrors.title && (
              <div className="text-red-500 text-sm mt-1">{validationErrors.title}</div>
            )}
            <div className="text-sm text-gray-400 mt-1">
              작성 중인 사용자 IP ·{" "}
              {isIpLoading ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                userIp
              )}
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
            <div className={`${validationErrors.code ? 'border-red-500' : ''}`}>
              {renderEditorContainer()}
            </div>
            {validationErrors.code && (
              <div className="text-red-500 text-sm mt-2">{validationErrors.code}</div>
            )}
          </div>
          <div className="flex justify-end">
            <WriteButton 
              onWrite={handleSubmit} 
              onCancel={() => window.history.back()} 
            />
          </div>
        </form>
      </div>
    </main>
  );
}