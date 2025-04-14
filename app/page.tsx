"use client";

import Link from "next/link";
import GuideSection from "@/components/guide";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useState, useEffect } from "react";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react"; // Added the Loader2 import

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

export default function Home() {
  const [category, setCategory] = useState("전체");
  const [codeSnippets, setCodeSnippets] = useAtom(codeSnippetsAtom);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (codeSnippets.length === 0) {
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
        } catch (error) {
          console.error("Failed to fetch snippets: ", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSnippets();
    }
  }, [codeSnippets, setCodeSnippets]);

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
            <div className="text-center py-4 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>로딩 중...</p>
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
