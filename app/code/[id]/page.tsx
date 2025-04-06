"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import CodeViewer from "@/components/code-viewer"
import { downloadCode, maskName, getRelativeTime, languageColors } from "@/utils/code-utils"
import Header from "@/components/layout/header"

const codeSnippets = [
  {
    id: 1,
    title: "React 커스텀 훅: useLocalStorage",
    description: "로컬 스토리지를 쉽게 사용할 수 있는 React 커스텀 훅입니다.",
    language: "TypeScript",
    author: "김민준",
    likes: 24,
    views: 128,
    createdAt: "2023-11-15T12:30:00Z",
    tags: ["React", "Hooks", "Frontend"],
    code: `import { useState, useEffect } from 'react';

// 로컬 스토리지를 사용하는 커스텀 훅 
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
// 상태 초기화
const [storedValue, setStoredValue] = useState<T>(() => {
  if (typeof window === "undefined") {
    return initialValue;
  }
  
  try {
    // 로컬 스토리지에서 값 가져오기
    const item = window.localStorage.getItem(key);
    // 값이 있으면 JSON 파싱, 없으면 초기값 반환
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

// 사용 예시
// const [name, setName] = useLocalStorage<string>("name", "");
// const [items, setItems] = useLocalStorage<string[]>("items", []);`,
  },
  {
    id: 2,
    title: "Spring Boot JWT 인증 구현 예제",
    description: "Spring Security와 JWT를 활용한 인증 시스템 구현 코드입니다.",
    language: "Java",
    author: "이지훈",
    likes: 36,
    views: 210,
    createdAt: "2023-11-12T09:15:00Z",
    tags: ["Spring", "Security", "Backend"],
    code: `// 샘플 코드`,
  },
]

export default function CodeDetailPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const snippet = codeSnippets.find((s) => s.id === id)

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

  const handleDownloadCode = () => {
    const filename = snippet.title
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "_")
      .toLowerCase()

    downloadCode(snippet.code, filename, snippet.language)
  }

  const relativeTime = getRelativeTime(snippet.createdAt)

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
            <span className="text-gray-500 text-xs">{maskName(snippet.author)}</span>
            <span className="text-gray-500 text-xs">{relativeTime}</span>
          </div>

          <h1 className="text-3xl font-bold">{snippet.title}</h1>
        </div>

        <div className="mb-6">
          <CodeViewer code={snippet.code} language={snippet.language} onDownload={handleDownloadCode} />
        </div>
      </div>
    </div>
  )
}

