"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Folder } from "lucide-react"
import CodeViewer from "@/components/code-viewer"
import { downloadCode, getRelativeTime, languageColors } from "@/utils/code-utils"
import Header from "@/components/layout/header"
import useFileTree from "@/hooks/use-file-tree"
import FileTree, { type FileNode } from "@/components/file-tree"
import FileViewer from "@/components/file-viewer"
import React from "react"

const codeSnippets = [
  {
    id: 1,
    title: "React 커스텀 훅: useLocalStorage",
    description: "로컬 스토리지를 쉽게 사용할 수 있는 React 커스텀 훅입니다.",
    language: "TypeScript",
    createdAt: "2023-11-15T12:30:00Z",
    code: `import { useState, useEffect } from 'react';

// 로컬 스토리지를 사용하는 커스텀 훅 
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
// 상태 초기화
const [storedValue, setStoredValue] = useState<T>(() => {
  if (typeof window === "undefined") {
    return initialValue;
  }
  
  try {
    // 로컬 스토리지를 사용하는 코드
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(error);
    return initialValue;
  }
});

// 값이 변경될 때마다 로컬 스토리지 업데이트
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
}

`
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
      ? snippet.title
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "_")
          .toLowerCase()
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
        <h1 className="text-2xl font-bold mb-4">코드를 찾을 수 없습니다</h1>
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
            <span className={`${languageColors[snippet.language] || "text-blue-500"}`}>{snippet.language}</span>
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

              <div className="w-2/3 overflow-hidden">
                <FileViewer file={selectedFile} />
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
