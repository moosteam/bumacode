"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, FileCode, Folder, Copy, Check, Download, Clock } from "lucide-react";
import JSZip from "jszip";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import FileTree, { type FileNode } from "@/components/file-tree";
import Header from "@/components/layout/header";
import WriteButton from "@/components/ui/wirte-button";
import { detectLanguage, detectLanguageFromExtension, isBinaryFileType, languageDisplayNames } from "@/utils/file-types";

const LoadingEditor = ({ isZip }: { isZip?: boolean }) => {
  return (
    <div className="absolute inset-0 bg-white" style={{ height: isZip ? 'calc(100vh - 280px)' : 'calc(100vh - 380px)' }}>
      <div className="w-full h-full flex flex-col">
        <div className="h-10 bg-gray-50 border-b animate-pulse"></div>
        <div className="flex-1 flex">
          <div className="w-16 bg-gray-50 border-r animate-pulse"></div>
          <div className="flex-1 p-4">
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
  const [titleLength, setTitleLength] = useState(0);
  const [code, setCode] = useState("");
  const [showPlaceholder, setShowPlaceholder] = useState(true);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [lineCount, setLineCount] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  
  const [editorHeight, setEditorHeight] = useState({
    zip: "calc(100vh - 200px)",
    single: "calc(100vh - 300px)"
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

  const [isDragging, setIsDragging] = useState(false);

  const [expireMinutes, setExpireMinutes] = useState(5);
  const [isPermanent, setIsPermanent] = useState(false);

  const expirationOptions = [
    { value: 5, label: '5분' },
    { value: 10, label: '10분' },
    { value: 15, label: '15분' },
    { value: 20, label: '20분' },
    { value: 30, label: '30분' },
    { value: 60, label: '1시간' },
    { value: 120, label: '2시간' },
    { value: 180, label: '3시간' },
    { value: 240, label: '4시간' },
    { value: 360, label: '6시간' },
    { value: 720, label: '12시간' },
    { value: 1440, label: '24시간' },
  ];

  const CodeEditorLoadingSkeleton = () => (
    <div className="h-full bg-white" style={{ height: isZipMode ? editorHeight.zip : editorHeight.single }}>
      <div className="flex flex-col h-full">
        <div className="h-10 bg-gray-50 border-b animate-pulse"></div>
        <div className="flex-1 flex">20
          <div className="w-16 bg-gray-50 border-r animate-pulse"></div>
          <div className="flex-1 p-4">
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const updateEditorHeight = () => {
      setEditorHeight({
        zip: `calc(100vh - 200px)`,
        single: `calc(100vh - 300px)`
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
    
    // Add placeholder text if editor is empty
    if (!editor.getValue()) {
      editor.setValue("// 여기에 코드를 입력하세요.");
      editor.getModel().updateOptions({ tabSize: 2 });
    }
    
    // Add event listeners for placeholder behavior
    editor.onDidFocusEditorText(() => {
      if (editor.getValue() === "// 여기에 코드를 입력하세요.") {
        editor.setValue("");
        setShowPlaceholder(false);
      }
    });
    
    editor.onDidBlurEditorText(() => {
      if (!editor.getValue()) {
        editor.setValue("// 여기에 코드를 입력하세요.");
        setShowPlaceholder(true);
      }
    });

    // Focus the editor and handle placeholder
    if (editor.getValue() === "// 여기에 코드를 입력하세요.") {
      editor.setValue("");
      setShowPlaceholder(false);
    }
    editor.focus();
  };

  const generateRandomString = (length: number = 8): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const processFileName = (name: string): string => {
    const hasKorean = /[가-힣]/.test(name);
    if (hasKorean) {
      return `${generateRandomString()}_${Date.now()}${name.slice(name.lastIndexOf('.'))}`;
    }
    return name;
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
          const processedPathParts = pathParts.map(part => processFileName(part));
          const fileNode = addFileToTree(root, processedPathParts);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const hasKorean = /[가-힣]/.test(file.name);
    const randomFileName = hasKorean 
      ? `${generateRandomString()}_${Date.now()}${file.name.slice(file.name.lastIndexOf('.'))}`
      : file.name;

    setFileName(randomFileName);
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
        if (tree.children) {
          const processNode = (node: FileNode) => {
            if (node.name) {
              node.name = processFileName(node.name);
            }
            if (node.children) {
              node.children.forEach(processNode);
            }
          };
          processNode(tree);
        }
        
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
    if (isSubmitting) return;
    
    const errors: { title?: string; code?: string } = {};
    
    if (!title.trim()) {
      errors.title = "*제목을 입력해주세요.";
    }
    if (!isZipMode && !isBinaryFile && (!code.trim() || code === "// 여기에 코드를 입력하세요.")) {
      errors.code = "*코드를 입력해주세요.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('expireMinutes', isPermanent ? '0' : expireMinutes.toString());
      
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
          const newZipFile = new File([zipBlob], fileName || 'archive.zip', { type: 'application/zip' });
          formData.append('file', newZipFile);
        }
      } else {
        if (isBinaryFile && binaryFileInfo) {
          if (fileInputRef.current?.files?.[0]) {
            formData.append('file', fileInputRef.current.files[0]);
          }
        } else {
          formData.append('code', code);
          if (fileName && !isBinaryFile) {
            const file = new File([code], fileName, { type: 'text/plain' });
            formData.append('file', file);
          }
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
    } finally {
      setIsSubmitting(false);
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
    const newValue = value || "";
    setCode(newValue);
    setShowPlaceholder(newValue === "// 여기에 코드를 입력하세요." || !newValue);
  };

  const getLanguageDisplay = (lang: string): string => {
    return languageDisplayNames[lang] || lang;
  };

  const editorOptions = {
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
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
    lineHeight: 21,
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
    lineDecorationsWidth: 0,
    placeholder: "// 여기에 코드를 입력하세요."
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleFileUpload(event);
    }
  };

  const renderEditorContainer = () => {
    if (isBinaryFile && binaryFileInfo) {
      return (
        <div 
          className={`border rounded-lg overflow-hidden bg-white code-viewer-container relative ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`} 
          style={{ height: editorHeight.single }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
        <div 
          className={`border rounded-lg overflow-hidden bg-white code-viewer-container relative ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`} 
          style={{ height: editorHeight.zip }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
        <div 
          className={`border rounded-lg overflow-hidden bg-white code-viewer-container relative ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`} 
          style={{ height: editorHeight.single }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
            <div className="flex justify-between items-center">
              <textarea
                ref={titleInputRef}
                value={title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  if (newTitle.length <= 25) {
                    setTitle(newTitle);
                    setTitleLength(newTitle.length);
                    if (validationErrors.title) {
                      setValidationErrors(prev => ({ ...prev, title: undefined }));
                    }
                  }
                }}
                className={`w-full text-4xl font-bold border-none outline-none resize-none overflow-hidden ${
                  validationErrors.title ? 'border-b-2 border-red-500' : ''
                }`}
                placeholder="제목을 입력하세요."
                rows={1}
                maxLength={25}
                required
              />
              <span className="text-sm text-gray-400 ml-2">
                {titleLength}/25
              </span>
            </div>
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
            <div className={`${validationErrors.code ? 'border-red-500' : ''}`}>
              {renderEditorContainer()}
            </div>
            {validationErrors.code && (
              <div className="text-red-500 text-sm mt-2">{validationErrors.code}</div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".txt,.js,.jsx,.ts,.tsx,.html,.css,.scss,.json,.md,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.dart,.sh,.bat,.cmd,.ps1,.zip"
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Upload size={16} />
                  <span>파일 업로드</span>
                </button>
                {fileName && (
                  <span className="text-sm text-gray-500 ml-1 truncate max-w-[200px]">
                    {fileName}
                  </span>
                )}
              </div>
              <div className="h-4 w-px bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="permanent"
                    checked={isPermanent}
                    onChange={(e) => {
                      setIsPermanent(e.target.checked);
                      if (e.target.checked) {
                        setExpireMinutes(0);
                      } else {
                        setExpireMinutes(20);
                      }
                    }}
                    className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="permanent" className="text-sm text-gray-600">
                    영구 보존
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={expireMinutes}
                      onChange={(e) => setExpireMinutes(Number(e.target.value))}
                      disabled={isPermanent}
                      className={`text-sm border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        isPermanent ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
                      }`}
                    >
                      {expirationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center whitespace-nowrap">
                    <Clock size={12} className="mr-1" />
                    {isPermanent 
                      ? "자동 삭제 없음"
                      : `${expireMinutes}분 후 자동 삭제`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>작성 중...</span>
                  </div>
                ) : (
                  '작성하기'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}