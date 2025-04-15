"use client"

import { useEffect, useRef, useState } from "react"
import React from "react"
import Link from "next/link"
import { ArrowLeft, Download, Folder, Copy, Check, FileCode, ExternalLink } from "lucide-react"
import dynamic from "next/dynamic"
import "highlight.js/styles/github.css"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import useFileTree from "@/hooks/use-file-tree"
import FileTree, { type FileNode } from "@/components/file-tree"
import { downloadCode, getRelativeTime } from "@/utils/code-utils"
import { detectLanguageFromExtension } from "@/components/highlight"

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">뷰어 로딩 중...</div>
    </div>
  )
})

type Snippet = {
  id: number
  title: string
  filePath: string
  userIp: string
  createdAt: string
  code?: string
  type?: string
  fileType?: string
}

function DetailSkeleton() {
  return (
    <div className="mb-6">
      <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
    </div>
  )
}

function FileCodeViewerSkeleton() {
  const lineWidths = [75, 85, 65, 90, 70, 80, 95, 75, 85, 70, 80, 75, 85, 65, 70, 90];
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center">
          <FileCode size={16} className="mr-2 text-gray-500" />
          <div className="h-5 bg-gray-300 rounded w-32 animate-pulse mr-3"></div>
          <div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div>
        </div>
        <div className="flex items-center">
          <div className="h-7 bg-gray-300 rounded w-56 animate-pulse"></div>
        </div>
      </div>
      <div className="h-[calc(60vh-120px)] bg-white border-t">
        <div className="h-full p-3">
          {lineWidths.map((width, i) => (
            <div 
              key={i}
              className="flex items-center mb-1"
            >
              <div className="text-xs text-gray-400 w-10 text-right pr-3">
                {i + 1}
              </div>
              <div 
                className="h-5 bg-gray-100 rounded flex-1 animate-pulse"
                style={{ width: `${width}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ZipCodeViewerSkeleton() {
  const folderWidths = [60, 55, 70, 65, 50, 75, 60, 55];
  const codeWidths = [80, 85, 70, 75, 90, 65, 75, 80, 70, 85, 75, 90, 65, 80];
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Folder size={16} className="mr-2 text-gray-500" />
          <div className="h-5 bg-gray-300 rounded w-16 animate-pulse mr-3"></div>
          <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-7 bg-gray-300 rounded w-56 animate-pulse"></div>
      </div>
      <div className="flex h-[calc(60vh-120px)]">
        <div className="w-1/4 border-r bg-white p-3">
          {folderWidths.map((width, i) => (
            <div key={i} className="mb-3">
              <div 
                className="h-4 bg-gray-200 rounded mb-2 animate-pulse"
                style={{ width: `${width}%` }}
              ></div>
              {i % 2 === 0 && (
                <div className="pl-4">
                  {[...Array(2)].map((_, j) => (
                    <div 
                      key={j} 
                      className="h-3 bg-gray-200 rounded mb-2 animate-pulse"
                      style={{ width: `${width - 10}%` }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="w-3/4 bg-white">
          <div className="bg-gray-100 px-3 py-2 border-b flex justify-between items-center">
            <div className="flex items-center">
              <FileCode size={16} className="mr-2 text-gray-500" />
              <div className="h-4 bg-gray-300 rounded w-32 animate-pulse mr-3"></div>
              <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
            </div>
            <div className="flex items-center">
              <div className="h-7 bg-gray-300 rounded w-56 animate-pulse"></div>
            </div>
          </div>
          <div className="h-[calc(60vh-180px)] bg-white border-t p-3">
            {codeWidths.map((width, i) => (
              <div 
                key={i}
                className="flex items-center mb-1"
              >
                <div className="text-xs text-gray-400 w-10 text-right pr-3">
                  {i + 1}
                </div>
                <div 
                  className="h-5 bg-gray-100 rounded flex-1 animate-pulse"
                  style={{ width: `${width}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params)
  const { id } = unwrappedParams
  const snippetId = Number.parseInt(id)
  const [snippet, setSnippet] = useState<Snippet | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const {
    fileTree,
    loadExampleZip,
    handleDownloadZip,
    setOriginalZipFile,
    getFileContent
  } = useFileTree()
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [selectedFileContent, setSelectedFileContent] = useState<string>("")
  const [selectedFileLanguage, setSelectedFileLanguage] = useState<string>("plaintext")
  const [lineCount, setLineCount] = useState(0)
  const [fileSize, setFileSize] = useState(0)
  const [zipCopied, setZipCopied] = useState(false)

  useEffect(() => {
    const fetchSnippet = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/write-get`)
        const data = await res.json()
        const found = data.items.find((item: Snippet) => item.id === snippetId)
        if (found) {
          setSnippet(found)
        }
      } catch (error) {
        console.error("Failed to fetch snippet: ", error)
      }
    }
    fetchSnippet()
  }, [snippetId])

  const isZip = snippet ? 
    snippet.filePath.toLowerCase().endsWith(".zip") || 
    snippet.type === "zip" || 
    snippet.fileType === "zip" : 
    false

  useEffect(() => {
    if (snippet && !isZip) {
      if (snippet.code) {
        setLineCount(snippet.code.split('\n').length);
        setFileSize(new TextEncoder().encode(snippet.code).length);
        setLoading(false);
        return;
      }
      fetch(snippet.filePath)
        .then((res) => res.text())
        .then((code) => {
          setLineCount(code.split('\n').length);
          setFileSize(new TextEncoder().encode(code).length);
          setSnippet((prev) => (prev ? { ...prev, code } : prev));
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load code content", err);
          setLoading(false);
        });
    }
  }, [snippet, isZip]);

  useEffect(() => {
    if (snippet && isZip) {
      fetch(snippet.filePath)
        .then((res) => res.blob())
        .then((blob) => {
          setFileSize(blob.size);
          setOriginalZipFile(blob)
          loadExampleZip().then(() => {
            setLoading(false)
          })
        })
        .catch((err) => {
          console.error("Failed to fetch zip file:", err)
          setLoading(false)
        })
    }
  }, [snippet, isZip, setOriginalZipFile, loadExampleZip])

  const handleDownloadCode = () => {
    const filename = snippet?.title
      ? snippet.title.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_").toLowerCase()
      : "code_snippet"
    if (snippet && snippet.code) {
      downloadCode(snippet.code, filename, "plaintext")
    }
  }

  const handleDownloadFile = () => {
    if (selectedFile?.name && selectedFileContent) {
      downloadCode(selectedFileContent, selectedFile.name, selectedFileLanguage)
    }
  }

  const openRawCode = () => {
    if (snippet && snippet.filePath) {
      window.open(snippet.filePath, '_blank');
    }
  }

  const handleCopyCode = () => {
    if (snippet && snippet.code) {
      navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const relativeTime = snippet ? getRelativeTime(snippet.createdAt) : ""

  const handleSelectFile = async (node: FileNode) => {
    setSelectedFile(node)
    
    if (node.type === "file") {
      try {
        const content = await getFileContent(node.path);
        setSelectedFileContent(content);
        setLineCount(content.split('\n').length);
        setFileSize(new TextEncoder().encode(content).length);
        
        setSelectedFileLanguage(
          node.language ||
            detectLanguageFromExtension(node.name) ||
            "plaintext"
        )
      } catch (err) {
        console.error("파일 내용 로드 실패:", err);
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const handleZipCopyCode = () => {
    if (selectedFileContent) {
      navigator.clipboard.writeText(selectedFileContent);
      const btn = document.activeElement as HTMLButtonElement;
      if (btn) {
        const span = btn.querySelector('span');
        const icon = btn.querySelector('svg');
        if (span && icon) {
          icon.classList.add('text-gray-600');
          setTimeout(() => {
            icon.classList.remove('text-gray-600');
          }, 2000);
        }
      }
      setZipCopied(true);
      setTimeout(() => setZipCopied(false), 2000);
    }
  };

  const selectedFileSlocCount = selectedFileContent.split('\n').filter(line => line.trim().length > 0).length;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {!snippet || loading ? (
            <>
              <DetailSkeleton />
              {isZip ? <ZipCodeViewerSkeleton /> : <FileCodeViewerSkeleton />}
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{snippet.title}</h1>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-gray-500 text-sm">{relativeTime} 10분 뒤에 이 코드가 삭제돼요.</span>
                </div>
              </div>
              
              {isZip ? (
                <div className="border rounded-lg overflow-hidden bg-white code-viewer-container">
                  <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center" style={{ height: '40px' }}>
                    <div className="flex items-center h-full">
                      <Folder size={16} className="mr-2 text-gray-500" />
                      <span className="font-semibold text-sm">코드</span>
                      {!selectedFile && <span className="ml-4 text-gray-500 text-xs">{formatFileSize(fileSize)}</span>}
                      {selectedFile && selectedFile.type === "file" && (
                        <span className="ml-4 flex items-center">
                          <span className="text-black font-medium text-xs">{selectedFile.name}</span>
                          <span className="text-gray-500 text-xs">  · {lineCount} Lines ({selectedFileSlocCount} sloc) · {formatFileSize(fileSize)}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="text-xs flex items-center">
                        {selectedFile && selectedFile.type === "file" && (
                          <button className="flex items-center gap-1.5 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors" 
                                  onClick={handleZipCopyCode}>
                            {zipCopied ? <Check size={14} className="text-gray-600" /> : <Copy size={14} />}
                            <span>{zipCopied ? "복사됨" : "복사"}</span>
                          </button>
                        )}
                        {selectedFile && selectedFile.type === "file" && (
                          <button className="flex items-center gap-1.5 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors" 
                                  onClick={handleDownloadFile}>
                            <Download size={14} />
                            <span>파일 다운로드</span>
                          </button>
                        )}
                        {handleDownloadZip && (
                          <button onClick={handleDownloadZip} 
                                  className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
                            <Download size={14} />
                            <span>ZIP 다운로드</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full" style={{ height: 'calc(100% - 40px)' }}>
                    <div className="w-1/5 overflow-y-auto bg-white custom-scrollbar" style={{ borderRight: '0.5px solid #E5E5E5' }}>
                      <FileTree root={fileTree} onSelectFile={handleSelectFile} />
                    </div>
                    <div className="w-4/5" style={{ paddingLeft: '2px' }}>
                      {selectedFile && selectedFile.type === "file" ? (
                        <CodeViewer
                          code={selectedFileContent}
                          language={selectedFileLanguage}
                          lineCount={lineCount}
                          fileSize={fileSize}
                          onDownload={handleDownloadFile}
                          showHeader={false}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          표시할 파일을 선택하세요.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden bg-white code-viewer-container">
                  <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center" style={{ height: '40px' }}>
                    <div className="flex items-center">
                      <FileCode size={16} className="mr-2 text-gray-500" />
                      <span className="text-xs text-gray-600">
                        {lineCount} Lines ({snippet.code?.split('\n').filter(line => line.trim().length > 0).length} sloc) · {formatFileSize(fileSize)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xs flex items-center space-x-0">
                        {openRawCode && (
                          <button className="flex items-center gap-1.5 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors" 
                                  onClick={openRawCode}>
                            <ExternalLink size={14} />
                            <span>Raw</span>  
                          </button>
                        )}
                        <button 
                          className="flex items-center gap-1.5 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors" 
                          onClick={() => {
                            if (snippet && snippet.code) {
                              navigator.clipboard.writeText(snippet.code);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }
                          }}>
                          {copied ? <Check size={14} className="text-gray-600" /> : <Copy size={14} />}
                          <span>{copied ? "복사됨" : "복사"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="h-full" style={{ height: 'calc(100% - 40px)' }}>
                    <CodeViewer
                      code={snippet.code || ""}
                      language="plaintext"
                      lineCount={lineCount}
                      fileSize={fileSize}
                      filePath={snippet.filePath}
                      onDownload={handleDownloadCode}
                      onOpenRaw={openRawCode}
                      showHeader={false}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function CodeViewer({ 
  code, 
  language, 
  lineCount = 0,
  fileSize = 0,
  filePath = "",
  onDownload,
  onOpenRaw,
  showHeader = true
}: { 
  code: string; 
  language: string; 
  title?: string; 
  lineCount?: number;
  fileSize?: number;
  filePath?: string;
  onDownload?: () => void;
  onOpenRaw?: () => void;
  showHeader?: boolean;
}) {
  const [copied, setCopied] = useState(false)
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
    editor.updateOptions({
      readOnly: true,
      domReadOnly: true,
      cursorBlinking: "solid",
    })
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const slocCount = code.split('\n').filter(line => line.trim().length > 0).length;
  
  const formattedFileSize = (fileSize / 1024).toFixed(1) + ' KB';

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
    readOnly: true,
    domReadOnly: true,
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
  }
  
  const monacoLanguage = language.toLowerCase() === 'plaintext' ? 'text' : language.toLowerCase();

  return (
    <div className="h-full bg-white">
      <Editor
        height="100%"
        width="100%"
        language={monacoLanguage}
        value={code}
        theme="vs"
        onMount={handleEditorDidMount}
        options={editorOptions}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">뷰어 로딩 중...</div>
          </div>
        }
      />
    </div>
  )
}
