"use client";

import Link from "next/link";
import GuideSection from "@/components/guide";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useState, useEffect } from "react";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";

export type Snippet = {
  id: number;
  title: string;
  filePath: string;
  userIp: string;
  createdAt: string;
  type?: string;
  language?: string;
  deleteAfter?: string;
};

export const codeSnippetsAtom = atomWithStorage<Snippet[]>("codeSnippets", []);

// 스켈레톤 아이템 컴포넌트
const SkeletonItem = () => {
  return (
    <div className="pt-3 pb-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="bg-gray-200 h-3 w-16 rounded"></div>
        <div className="bg-gray-200 h-3 w-24 rounded"></div>
      </div>
      <div className="flex items-center mt-2">
        <div className="bg-gray-200 h-5 w-64 rounded"></div>
        <div className="ml-3 bg-gray-200 h-6 w-14 rounded-md"></div>
      </div>
    </div>
  );
};

export default function Home() {
  const [category, setCategory] = useState("전체");
  const [codeSnippets, setCodeSnippets] = useAtom(codeSnippetsAtom);
  const [loading, setLoading] = useState(true); // 초기값을 true로 설정
  const [dataFetched, setDataFetched] = useState(false); // 데이터 페치 완료 여부 상태 추가
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // 항상 로딩 상태로 시작
    const fetchSnippets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/write-get`);
        const data = await res.json();
        const transformedItems = data.items.map((item: Snippet) => ({
          ...item,
          type: item.type || "코드",
          language: item.language || "JavaScript",
          deleteAfter: item.deleteAfter || "5분 후 삭제",
        }));
        setCodeSnippets(transformedItems);
        setDataFetched(true); // 데이터 페치 완료 표시
      } catch (error) {
        console.error("Failed to fetch snippets: ", error);
        setDataFetched(true); // 에러가 있어도 페치 시도는 완료
      } finally {
        setLoading(false);
      }
    };

    // 초기 데이터 로드가 되지 않았거나 코드 스니펫이 비어있는 경우
    if (!dataFetched || codeSnippets.length === 0) {
      fetchSnippets();
    }
  }, [codeSnippets.length, dataFetched, setCodeSnippets]);

  const parseCreatedAt = (createdAt: string): Date => {
    const cleaned = createdAt.replace(/\./g, "-").replace(/\s+/g, " ").trim();
    const parts = cleaned.split(" ");
    if (parts.length >= 2) {
      return new Date(parts[0] + "T" + parts[1]);
    }
    return new Date(createdAt);
  };

  const filteredSnippets = codeSnippets.filter((snippet) => {
    if (category === "전체") return true;
    return snippet.type === category;
  });

  const sortedSnippets = filteredSnippets.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const displayUserIp = (ip: string) => {
    const segments = ip.split(".");
    return segments.slice(0, 2).join(".");
  };

  // 스켈레톤 UI 배열 생성
  const skeletonItems = Array(5).fill(0).map((_, index) => (
    <SkeletonItem key={`skeleton-${index}`} />
  ));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex-grow max-w-6xl mx-auto px-4 py-6 w-full">
        <GuideSection />

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-1.5 mb-4 flex items-center justify-between">
            <span>최근 등록된 코드</span>
            <div className="relative w-36">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 py-1 px-2.5 rounded-md text-sm font-medium pr-8"
                disabled={loading} // 로딩 중일 때 비활성화
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

          {loading ? (
            <div className="divide-y divide-gray-200">
              {skeletonItems}
            </div>
          ) : sortedSnippets.length === 0 ? (
            <div className="text-center py-4">
              <p>※ 등록된 코드가 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedSnippets.map((snippet) => {
                return (
                  <div key={snippet.id} className="pt-3 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">
                        {displayUserIp(snippet.userIp)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {snippet.deleteAfter}
                      </span>
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
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
