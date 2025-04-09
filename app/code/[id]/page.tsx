"use client"

import { useEffect, useRef, useState } from "react"
import React from "react"
import Link from "next/link"
import { ArrowLeft, Download, Folder, Copy, Check } from "lucide-react"
import hljs from "highlight.js"
import "highlight.js/styles/github.css"

import Header from "@/components/layout/header"
import useFileTree from "@/hooks/use-file-tree"
import FileTree, { type FileNode } from "@/components/file-tree"
import { downloadCode, getRelativeTime, languageColors as globalLanguageColors } from "@/utils/code-utils"

const codeSnippets = [
  {
    id: 1,
    title: "React 커스텀 훅: useLocalStorage",
    description: "로컬 스토리지를 쉽게 사용할 수 있는 React 커스텀 훅입니다.",
    language: "TypeScript",
    createdAt: "2023-11-15T12:30:00Z",
    code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}`,
  },
  {
    id: 2,
    title: "Spring Boot JWT 인증 구현 예제",
    description: "Spring Security와 JWT를 활용한 인증 시스템 구현 코드입니다.",
    language: "Java",
    createdAt: "2023-11-12T09:15:00Z",
    code: `// 샘플 코드`,
  },
  {
    id: 7,
    title: "Spring Boot 프로젝트 구조",
    description: "Spring Boot 프로젝트의 기본적인 폴더 구조와 설정 파일들에 대한 설명입니다.",
    language: "Java",
    createdAt: "2023-11-01T14:30:00Z",
    code: `// 샘플 코드`,
  },
]

export default function CodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params)
  const idString = unwrappedParams.id
  const id = idString ? Number.parseInt(idString) : null
  const snippet = codeSnippets.find((s) => s.id === id)
  const { fileTree, loadExampleZip, handleDownloadZip } = useFileTree()
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)

  useEffect(() => {
    if (id === 7) {
      loadExampleZip()
    }
  }, [id, loadExampleZip])

  const handleDownloadCode = () => {
    const filename = snippet?.title
      ? snippet.title.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_").toLowerCase()
      : "code_snippet"

    if (snippet) {
      downloadCode(snippet.code, filename, snippet.language)
    }
  }

  const relativeTime = snippet ? getRelativeTime(snippet.createdAt) : ""

  const handleSelectFile = (node: FileNode) => {
    setSelectedFile(node)
  }

  if (!snippet) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">코드를 찾을 수 없습니다</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/" className="flex items-center text-blue-500 mb-6">
          <ArrowLeft size={16} className="mr-1" />
          <span>목록으로 돌아가기</span>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`${globalLanguageColors[snippet.language] || "text-blue-500"}`}>{snippet.language}</span>
            <span className="text-gray-500 text-xs">{relativeTime}</span>
          </div>

          <h1 className="text-3xl font-bold">{snippet.title}</h1>
        </div>

        {id === 7 ? (
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
              <div className="text-sm font-medium flex items-center">
                <Folder size={16} className="mr-2" />
                <span>폴더 구조</span>
              </div>
              {handleDownloadZip && (
                <button onClick={handleDownloadZip} className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700">
                  <Download size={14} />
                  <span>ZIP 다운로드</span>
                </button>
              )}
            </div>

            <div className="flex h-[500px]">
              <div className="w-1/3 border-r overflow-y-auto bg-gray-50 hide-scrollbar">
                <FileTree root={fileTree} onSelectFile={handleSelectFile} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <CodeViewer code={snippet.code} language={snippet.language} onDownload={handleDownloadCode} />
          </div>
        )}
      </div>
    </div>
  )
}

function CodeViewer({
  code,
  language,
  title,
  onDownload,
}: {
  code: string
  language: string
  title?: string
  onDownload?: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState("")
  const codeRef = useRef<HTMLDivElement>(null)

  const lineNumbers = code.split("\n").map((_, i) => (i + 1).toString())

  useEffect(() => {
    try {
      const highlighted = hljs.highlight(code, { language: language.toLowerCase() }).value
      setHighlightedCode(highlighted)
    } catch (error) {
      console.error("Highlighting error:", error)
      setHighlightedCode(code)
    }
  }, [code, language])

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

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50">
      <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center">
          {title && <span className="mr-2">{title}</span>}
          <span className={`font-medium ${languageColor}`}>{language}</span>
        </div>
        <div className="flex items-center gap-3">
          {onDownload && (
            <button
              className="text-sm flex items-center gap-1 text-blue-500 hover:text-blue-700"
              onClick={onDownload}
            >
              <Download size={16} />
              <span>다운로드</span>
            </button>
          )}
          <button
            className="text-sm flex items-center gap-1 text-blue-500 hover:text-blue-700"
            onClick={handleCopyCode}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "복사됨" : "복사하기"}</span>
          </button>
        </div>
      </div>

      <div className="flex w-full">
        <div className="bg-gray-100 text-gray-500 px-3 py-4 text-right select-none font-mono text-sm leading-relaxed">
          {lineNumbers.map((num, i) => (
            <div key={i}>{num}</div>
          ))}
        </div>

        <div className="bg-white px-3 py-4 overflow-x-auto w-full font-mono text-sm leading-relaxed">
          <pre className="m-0">
            <code
              ref={codeRef}
              className={`language-${language.toLowerCase()}`}
              dangerouslySetInnerHTML={{
                __html: highlightedCode || "<span class='text-gray-700'>코드가 존재하지 않습니다:(</span>",
              }}
            />
          </pre>
        </div>
      </div>
    </div>
  )
}
