"use client"

import { useEffect, useRef, useState } from "react"
import React from "react"
import Link from "next/link"
import { ArrowLeft, Download, Folder, Copy, Check, FileCode, ExternalLink } from "lucide-react"
import dynamic from "next/dynamic"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import useFileTree from "@/hooks/use-file-tree"
import FileTree, { type FileNode } from "@/components/file-tree"
import { downloadCode, getRelativeTime } from "@/utils/code-utils"
import { detectLanguageFromExtension } from "@/components/highlight"

const CodeEditorLoadingSkeleton = () => (
  <div className="h-full bg-white p-3">
    <div className="h-full bg-gray-200 rounded animate-pulse"></div>
  </div>
);

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <CodeEditorLoadingSkeleton />
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
  return (
    <div className="border rounded-lg overflow-hidden bg-white code-viewer-container">
      <div 
        className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
        style={{ height: '40px' }}
      >
        <div className="flex items-center">
          <div className="h-4 w-4 bg-gray-300 rounded mr-2 animate-pulse"></div>
          {/* 파일 확장자 자리 표시자 */}
          <div className="h-4 bg-gray-300 rounded w-8 animate-pulse mr-3"></div>
          {/* 추가 정보 자리 표시자 - 정확한 높이와 세로 중앙 정렬 */}
          <div className="h-4 bg-gray-300 rounded w-44 animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2">
          {/* 버튼 영역 - 실제 버튼 모양과 유사하게 */}
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-300 rounded-md w-14 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded-md w-14 animate-pulse"></div>
          </div>
        </div>
      </div>
      {/* 코드 영역 - 전체 큰 네모로 처리 */}
      <div className="h-full bg-white p-3" style={{height: 'calc(100% - 40px)'}}>
        <div className="h-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}

// ZIP 파일 스켈레톤 UI - 완전히 수정된 버전
function ZipCodeViewerSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-white code-viewer-container">
      {/* 상단 헤더 */}
      <div 
        className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
        style={{ height: '40px' }}
      >
        <div className="flex items-center">
          <div className="h-4 w-4 bg-gray-300 rounded mr-2 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-8 animate-pulse mr-3"></div>
          <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
        </div>
        <div className="flex items-center">
          {/* ZIP 다운로드 버튼 */}
          <div className="h-6 bg-gray-300 rounded-md w-24 animate-pulse"></div>
        </div>
      </div>
      {/* 본문 영역 */}
      <div className="flex" style={{ height: 'calc(100% - 40px)' }}>
        {/* 왼쪽 파일 트리 영역 */}
        <div className="w-1/5 border-r bg-white p-3" style={{ borderRight: '0.5px solid #E5E5E5' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-3">
              <div 
                className="h-4 bg-gray-200 rounded mb-2 animate-pulse"
                style={{ width: `${60 + (i % 3) * 5}%` }}
              ></div>
              {i % 2 === 0 && (
                <div className="pl-4">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div 
                      key={j}
                      className="h-3 bg-gray-200 rounded mb-2 animate-pulse"
                      style={{ width: `${50 + (j % 2) * 10}%` }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* 오른쪽 코드 뷰 영역 */}
        <div className="w-4/5" style={{ paddingLeft: '2px' }}>
          {/* 코드 뷰어 상단 헤더 */}
          <div 
            className="bg-gray-100 px-3 py-2 border-b flex justify-between items-center"
            style={{ height: '40px' }}
          >
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-300 rounded mr-2 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-20 animate-pulse mr-3"></div>
              <div className="h-4 bg-gray-300 rounded w-44 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 bg-gray-300 rounded-md w-14 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded-md w-24 animate-pulse"></div>
            </div>
          </div>
          {/* 코드 영역 - 전체 큰 네모로 처리 */}
          <div className="h-full border-t p-3" style={{ height: 'calc(100% - 40px)' }}>
            <div className="h-full bg-gray-200 rounded animate-pulse"></div>
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

  const isBinaryFile = snippet ? 
    snippet.filePath.toLowerCase().endsWith(".unitypackage") || 
    snippet.filePath.toLowerCase().endsWith(".xlsx") || 
    snippet.filePath.toLowerCase().endsWith(".xls") || 
    snippet.filePath.toLowerCase().endsWith(".doc") || 
    snippet.filePath.toLowerCase().endsWith(".docx") || 
    snippet.filePath.toLowerCase().endsWith(".pdf") || 
    snippet.filePath.toLowerCase().endsWith(".jpg") || 
    snippet.filePath.toLowerCase().endsWith(".jpeg") || 
    snippet.filePath.toLowerCase().endsWith(".png") || 
    snippet.filePath.toLowerCase().endsWith(".gif") || 
    snippet.filePath.toLowerCase().endsWith(".bmp") || 
    snippet.filePath.toLowerCase().endsWith(".ico") || 
    snippet.filePath.toLowerCase().endsWith(".svg") || 
    snippet.filePath.toLowerCase().endsWith(".mp3") || 
    snippet.filePath.toLowerCase().endsWith(".mp4") || 
    snippet.filePath.toLowerCase().endsWith(".wav") || 
    snippet.filePath.toLowerCase().endsWith(".avi") || 
    snippet.filePath.toLowerCase().endsWith(".mov") || 
    snippet.filePath.toLowerCase().endsWith(".wmv") || 
    snippet.filePath.toLowerCase().endsWith(".psd") || 
    snippet.filePath.toLowerCase().endsWith(".ai") || 
    snippet.filePath.toLowerCase().endsWith(".sketch") : 
    false;

  useEffect(() => {
    if (snippet && !isZip && !isBinaryFile) {
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
    } else if (snippet && isBinaryFile) {
      // 바이너리 파일인 경우
      fetch(snippet.filePath)
        .then((res) => res.blob())
        .then((blob) => {
          setFileSize(blob.size);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch binary file:", err);
          setLoading(false);
        });
    }
  }, [snippet, isZip, isBinaryFile]);

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

  const handleBinaryFileDownload = () => {
    if (snippet && snippet.filePath) {
      window.open(snippet.filePath, '_blank');
    }
  };

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
                  <span className="text-gray-500 text-sm">
                    {relativeTime} {snippet.createdAt.substring(0, snippet.createdAt.lastIndexOf(':'))} 등록 · 18분 후 삭제
                  </span>
                </div>
              </div>
              
              {isZip ? (
                <div className="border rounded-lg overflow-hidden bg-white code-viewer-container">
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
                          <span className="text-gray-500 text-xs">  · {lineCount} Lines ({selectedFileSlocCount} sloc) · {formatFileSize(fileSize)}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="text-xs flex items-center">
                        {selectedFile && selectedFile.type === "file" && (
                          <button 
                            className="flex items-center gap-1.5 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
                            onClick={handleZipCopyCode}
                          >
                            {zipCopied ? <Check size={14} className="text-gray-600" /> : <Copy size={14} />}
                            <span>{zipCopied ? "복사됨" : "복사"}</span>
                          </button>
                        )}
                        {selectedFile && selectedFile.type === "file" && (
                          <button 
                            className="flex items-center gap-1.5 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
                            onClick={handleDownloadFile}
                          >
                            <Download size={14} />
                            <span>파일 다운로드</span>
                          </button>
                        )}
                        {handleDownloadZip && (
                          <button 
                            onClick={handleDownloadZip}
                            className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
                          >
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
              ) : isBinaryFile ? (
                <div className="border rounded-lg overflow-hidden bg-white code-viewer-container">
                  <div 
                    className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
                    style={{ height: '40px' }}
                  >
                    <div className="flex items-center">
                      <FileCode size={16} className="mr-2 text-gray-500" />
                      <span className="font-semibold text-sm">
                        {snippet.filePath ? snippet.filePath.split('.').pop()?.toLowerCase() || 'bin' : 'bin'}
                      </span>
                      <span className="ml-4 text-xs text-gray-600">
                        {formatFileSize(fileSize)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xs flex items-center space-x-2">
                        <button 
                          className="flex items-center gap-1.5 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
                          onClick={handleBinaryFileDownload}
                        >
                          <Download size={14} />
                          <span>다운로드</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="h-full" style={{ height: 'calc(100% - 40px)' }}>
                    <div className="flex items-center justify-center h-full flex-col p-8 bg-gray-50">
                      <FileCode size={48} className="text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">{snippet.filePath ? snippet.filePath.split('/').pop() || 'bin' : 'bin'}</h3>
                      <div className="text-gray-500 text-sm space-y-1">
                        <p>파일 크기: {formatFileSize(fileSize)}</p>
                        <p>파일 형식: {snippet.filePath ? snippet.filePath.split('.').pop()?.toLowerCase() || 'bin' : 'bin'}</p>
                      </div>
                      <p className="text-gray-400 text-sm mt-4">
                        이 파일은 바이너리 파일이므로 미리보기를 제공하지 않습니다.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden bg-white code-viewer-container">
                  <div 
                    className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
                    style={{ height: '40px' }}
                  >
                    <div className="flex items-center">
                      <FileCode size={16} className="mr-2 text-gray-500" />
                      <span className="font-semibold text-sm">
                        {snippet.filePath ? snippet.filePath.split('.').pop()?.toLowerCase() || 'txt' : 'txt'}
                      </span>
                      <span className="ml-4 text-xs text-gray-600">
                        {lineCount} Lines ({snippet.code?.split('\n').filter(line => line.trim().length > 0).length} sloc) · {formatFileSize(fileSize)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xs flex items-center space-x-2">
                        {openRawCode && (
                          <button 
                            className="flex items-center gap-1.5 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
                            onClick={openRawCode}
                          >
                            <ExternalLink size={14} />
                            <span>Raw</span>
                          </button>
                        )}
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

  // 파일 확장자로부터 언어 감지
  const getMonacoLanguage = () => {
    if (filePath) {
      const extension = filePath.split('.').pop()?.toLowerCase() || '';
      const detectedLanguage = detectLanguageFromExtension(extension);
      return detectedLanguage || 'plaintext';
    }
    return language || 'plaintext';
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

  return (
    <div className="h-full bg-white">
      <Editor
        height="100%"
        width="100%"
        language={getMonacoLanguage()}
        value={code}
        theme="vs"
        onMount={handleEditorDidMount}
        options={editorOptions}
        loading={<CodeEditorLoadingSkeleton />}
      />
    </div>
  )
}