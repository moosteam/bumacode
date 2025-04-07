"use client"

import Link from "next/link"
import { Code } from "lucide-react"
import { maskName, getRelativeTime } from "@/utils/code-utils"
import GuideSection from "@/components/guide-section"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function Home() {
  const codeSnippets = [
    {
      id: 1,
      title: "React 커스텀 훅: useLocalStorage",
      description: "로컬 스토리지를 쉽게 사용할 수 있는 React 커스텀 훅입니다.",
      language: "TypeScript",
      author: "김민준",
      createdAt: "2023-11-15T12:30:00Z",
      deleteAfter: "5분 후 삭제",
    },
    {
      id: 2,
      title: "Spring Boot JWT 인증 구현 예제",
      description: "Spring Security와 JWT를 활용한 인증 시스템 구현 코드입니다.",
      language: "Java",
      author: "이지훈",
      createdAt: "2023-11-12T09:15:00Z",
      deleteAfter: "8분 후 삭제",
    },
    {
      id: 3,
      title: "Flutter 무한 스크롤 구현하기",
      description: "Flutter에서 효율적인 무한 스크롤 리스트 구현 방법입니다.",
      language: "Dart",
      author: "박서연",
      createdAt: "2023-11-10T14:45:00Z",
      deleteAfter: "16분 후 삭제",
    },
    {
      id: 4,
      title: "Node.js Express 미들웨어 작성법",
      description: "Express 애플리케이션에서 재사용 가능한 미들웨어 작성 방법을 소개합니다.",
      language: "JavaScript",
      author: "최준호",
      createdAt: "2023-11-08T08:20:00Z",
      deleteAfter: "10분 후 삭제",
    },
    {
      id: 5,
      title: "Python 데이터 분석 스크립트",
      description: "Pandas와 Matplotlib을 활용한 데이터 분석 및 시각화 스크립트입니다.",
      language: "Python",
      author: "정다은",
      createdAt: "2023-11-05T16:10:00Z",
      deleteAfter: "20분 후 삭제",
    },
    {
      id: 6,
      title: "Vue.js 컴포넌트 통신 예제",
      description: "Vue.js에서 컴포넌트 간 효율적인 통신 방법에 대한 예제 코드입니다.",
      language: "JavaScript",
      author: "한지민",
      createdAt: "2023-11-03T11:30:00Z",
      deleteAfter: "1분 후 삭제",
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <GuideSection />

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-1.5 mb-4">
            최근 등록된 코드
          </h2>

          <div className="divide-y divide-gray-200">
            <div className="pt-3 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-500 text-xs">{maskName("이지훈")}</span>
                <span className="text-gray-500 text-xs">{codeSnippets[1].deleteAfter}</span>
              </div>

              <h2 className="text-base font-semibold text-gray-800 transition-colors hover:text-blue-600">
                <Link href="/code/zip">
                  Spring Boot 프로젝트 구조
                </Link>
                <span className="ml-3 px-2 py-1 text-green-600 bg-green-50 text-xs rounded-md font-normal">ZIP 파일</span>
              </h2>
            </div>

            {codeSnippets.map((snippet) => (
              <div key={snippet.id} className="pt-3 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">{maskName(snippet.author)}</span>
                  <span className="text-gray-500 text-xs">{snippet.deleteAfter}</span>
                </div>

                <h2 className="text-base font-semibold text-gray-800 transition-colors hover:text-blue-600 flex items-center">
                  <Link href={`/code/${snippet.id}`}>
                    {snippet.title}
                  </Link>
                  <span className="ml-3 px-2 py-1 text-yellow-600 bg-yellow-50 text-xs rounded-md font-normal">코드</span>
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

      <div className="fixed bottom-8 right-8">
        <Link
          href="/write"
          className="bg-blue-500 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
        >
          <Code size={24} />
        </Link>
      </div>
      <Footer />
    </main>
  )
}
