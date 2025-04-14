"use client"

import { useEffect, useRef, useState } from "react"
import React from "react"
import Link from "next/link"
import { ArrowLeft, Download, Folder, Copy, Check } from "lucide-react"
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
}

export default function CodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params)
  const { id } = unwrappedParams
  const snippetId = Number.parseInt(id)
  const [snippet, setSnippet] = useState<Snippet | null>(null)
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

  useEffect(() => {
    const fetchSnippet = async () => {
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

  const isZip = snippet ? snippet.filePath.toLowerCase().endsWith(".zip") : false

  useEffect(() => {
    if (snippet && !isZip) {
      if (snippet.code) return
      fetch(snippet.filePath)
        .then((res) => res.text())
        .then((code) => {
          setSnippet((prev) => (prev ? { ...prev, code } : prev))
        })
        .catch((err) => console.error("Failed to load code content", err))
    }
  }, [snippet, isZip])

  useEffect(() => {
    if (snippet && isZip) {
      fetch(snippet.filePath)
        .then((res) => res.blob())
        .then((blob) => {
          setOriginalZipFile(blob)
        })
        .catch((err) => console.error("Failed to fetch zip file:", err))
    }
  }, [snippet, isZip, setOriginalZipFile])

  useEffect(() => {
    if (snippet && isZip) {
      loadExampleZip()
    }
  }, [snippet, isZip, loadExampleZip])

  const handleDownloadCode = () => {
    const filename = snippet?.title
      ? snippet.title.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_").toLowerCase()
      : "code_snippet"
    if (snippet && snippet.code) {
      downloadCode(snippet.code, filename, "plaintext")
    }
  }

  const relativeTime = snippet ? getRelativeTime(snippet.createdAt) : ""

  const handleSelectFile = (node: FileNode) => {
    setSelectedFile(node)
    if (node.type === "file") {
      getFileContent(node.path).then((content) => {
        setSelectedFileContent(content)
      })
      setSelectedFileLanguage(
        node.language ||
          detectLanguageFromExtension(node.name) ||
          "plaintext"
      )
    }
  }

  if (!snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500 text-lg">로딩중...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/" className="flex items-center text-blue-500 mb-2">
          <ArrowLeft size={16} className="mr-1" />
          <span>목록으로 돌아가기</span>
        </Link>
        {snippet === null ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <span className="text-gray-500 text-lg">로딩중...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-500 text-xs">{relativeTime}</span>
              </div>
              <h1 className="text-3xl font-bold">{snippet.title}</h1>
            </div>
            {isZip ? (
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-white px-4 py-2 border-b flex justify-between items-center">
                  <div className="text-sm font-medium flex items-center">
                    <Folder size={16} className="mr-2" />
                    <span>코드</span>
                  </div>
                  {handleDownloadZip && (
                    <button onClick={handleDownloadZip} className="flex items-center gap-1 text-sm text-black">
                      <Download size={14} />
                      <span>ZIP 다운로드</span>
                    </button>
                  )}
                </div>
                <div className="flex h-[500px]">
                  <div className="w-1/3 border-r overflow-y-auto bg-white hide-scrollbar">
                    <FileTree root={fileTree} onSelectFile={handleSelectFile} />
                  </div>
                  <div className="w-2/3">
                    {selectedFile && selectedFile.type === "file" ? (
                      <CodeViewer
                        code={selectedFileContent}
                        language={selectedFileLanguage}
                        title={selectedFile.name}
                        onDownload={() =>
                          selectedFile.content &&
                          downloadCode(
                            selectedFile.content,
                            selectedFile.name,
                            selectedFileLanguage
                          )
                        }
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
              <div className="mb-6">
                <CodeViewer
                  code={snippet.code || ""}
                  language="plaintext"
                  onDownload={handleDownloadCode}
                />
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

function CodeViewer({ code, language, title, onDownload }: { code: string; language: string; title?: string; onDownload?: () => void }) {
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

  const languageColors: Record<string, string> = {
    JavaScript: "text-yellow-500",
    TypeScript: "text-blue-500",
    Java: "text-red-500",
    Python: "text-green-500",
    "C#": "text-purple-500",
    "C++": "text-pink-500",
    Go: "text-cyan-500",
    Rust: "text-orange-500",
    Dart: "text-teal-500",
  }

  const languageColor = languageColors[language] || "text-blue-500"
  const editorOptions = {
    fontSize: 14,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    lineNumbers: "on",
    scrollbar: { vertical: "visible", horizontal: "visible" },
    wordWrap: "on",
    wrappingIndent: "same",
    readOnly: true,
    domReadOnly: true,
    renderValidationDecorations: "off",
  }
  const monacoLanguage = language.toLowerCase()

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-white px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center text-sm">
          {title && <span className="mr-2">{title}</span>}
          <span className={`font-medium ${languageColor}`}>{language}</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm flex items-center gap-1 text-blue-500 hover:text-blue-700" onClick={handleCopyCode}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "복사됨" : "복사하기"}</span>
          </button>
        </div>
      </div>
      <div className="h-[500px]">
        <Editor
          height="100%"
          width="100%"
          language={monacoLanguage}
          value={code}
          theme="light"
          onMount={handleEditorDidMount}
          options={editorOptions}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">뷰어 로딩 중...</div>
            </div>
          }
        />
      </div>
    </div>
  )
}
