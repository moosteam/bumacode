"use client"

import Link from "next/link"
import GuideSection from "@/components/guide"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useState } from "react"

export default function Home() {
  const [category, setCategory] = useState("전체")

  const codeSnippets = [
    {
      id: 1,
      title: "React 커스텀 훅: useLocalStorage",
      language: "TypeScript",
      createdAt: "2023-11-15T12:30:00Z",
      deleteAfter: "5분 후 삭제",
      type: "코드",
    },
    {
      id: 2,
      title: "Spring Boot JWT 인증 구현 예제",
      language: "Java",
      createdAt: "2023-11-12T09:15:00Z",
      deleteAfter: "8분 후 삭제",
      type: "ZIP 파일",
    },
    {
      id: 3,
      title: "Flutter 무한 스크롤 구현하기",
      language: "Dart",
      createdAt: "2023-11-10T14:45:00Z",
      deleteAfter: "16분 후 삭제",
      type: "코드",
    },
    {
      id: 4,
      title: "Node.js Express 미들웨어 작성법",
      language: "JavaScript",
      createdAt: "2023-11-08T08:20:00Z",
      deleteAfter: "10분 후 삭제",
      type: "코드",
    },
    {
      id: 5,
      title: "Python 데이터 분석 스크립트",
      language: "Python",
      createdAt: "2023-11-05T16:10:00Z",
      deleteAfter: "20분 후 삭제",
      type: "파일 및 이미지",
    },
    {
      id: 6,
      title: "Vue.js 컴포넌트 통신 예제",
      language: "JavaScript",
      createdAt: "2023-11-03T11:30:00Z",
      deleteAfter: "1분 후 삭제",
      type: "코드",
    },
    {
      id: 7,
      title: "Spring Boot 프로젝트 구조",
      language: "Java",
      createdAt: "2023-11-01T14:30:00Z",
      deleteAfter: "15분 후 삭제",
      type: "ZIP 파일",
    },
  ]

  const filteredSnippets = category === "전체" 
    ? codeSnippets 
    : codeSnippets.filter((snippet) => snippet.type === category)

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <GuideSection />

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-1.5 mb-4 flex items-center justify-between">
            <span>최근 등록된 코드</span>
            <div className="relative w-36">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 py-1 px-2.5 rounded-md text-sm font-medium pr-8"
              >
                <option value="전체">전체</option>
                <option value="ZIP 파일">ZIP 파일</option>
                <option value="파일 및 이미지">파일 및 이미지</option>
                <option value="코드">코드</option>
              </select>
              <div className="absolute top-1/2 right-2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </h2>

          <div className="divide-y divide-gray-200">
            {filteredSnippets.map((snippet) => (
              <div key={snippet.id} className="pt-3 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">192.10.⚹⚹⚹.⚹⚹</span>
                  <span className="text-gray-500 text-xs">{snippet.deleteAfter}</span>
                </div>

                <h2 className="text-base font-semibold text-gray-800 transition-colors hover:text-blue-600 flex items-center">
                  <Link href={`/code/${snippet.id}`}>{snippet.title}</Link>
                  <span
                    className={`ml-3 px-2 py-1 text-xs rounded-md font-normal ${
                      snippet.type === "코드"
                        ? "text-yellow-600 bg-yellow-50"
                        : snippet.type === "ZIP 파일"
                        ? "text-green-600 bg-green-50"
                        : snippet.type === "파일 및 이미지"
                        ? "text-blue-600 bg-blue-50"
                        : ""
                    }`}
                  >
                    {snippet.type}
                  </span>
                </h2>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <div className="inline-flex space-x-1">
            <button className="px-3 py-1 bg-blue-500 text-white rounded-md">1</button>
            <button className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-md">2</button>
            <button className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-md">3</button>
            <button className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-md">4</button>
            <button className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-md">5</button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
