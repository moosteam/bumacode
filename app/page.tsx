"use client";

import Link from "next/link";
import Image from "next/image";
import GuideSection from "@/components/guide";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useState, useEffect } from "react";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { isSameDay } from "date-fns";

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
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    const fetchSnippets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/write-get`);
        const data = await res.json();
        const transformedItems = data.items.map((item: Snippet) => ({
          ...item,
          type: item.type || "file",
          language: item.language || "JavaScript",
        }));
        setCodeSnippets(transformedItems);
        setDataFetched(true);
      } catch (error) {
        console.error("Failed to fetch snippets: ", error);
        setDataFetched(true);
      } finally {
        setLoading(false);
      }
    };

    if (!dataFetched || codeSnippets.length === 0) {
      fetchSnippets();
    }
  }, [codeSnippets.length, dataFetched, setCodeSnippets]);

  const parseCreatedAt = (createdAt: string): Date => {
    const parts = createdAt.split(" ");
    const dateParts = parts[0].split(".").map(part => part.trim());
    const timeParts = parts[1].split(":").map(part => part.trim());

    if (dateParts.length >= 3 && timeParts.length >= 3) {
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const day = parseInt(dateParts[2]);
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      const seconds = parseInt(timeParts[2]);

      const date = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
      
      // KST (UTC+9) 적용
      date.setHours(date.getHours() + 9); 
      return date;
    }
    // 예외 케이스나 잘못된 형식의 경우 현재 시간을 반환하거나 오류 처리
    console.warn("Could not parse createdAt string:", createdAt);
    return new Date(createdAt); // 기본 파싱 시도
  };

  const filteredSnippets = codeSnippets.filter((snippet) => {
    const categoryMatch = category === "전체" || snippet.type === category;
    const dateMatch = !selectedDate || isSameDay(parseCreatedAt(snippet.createdAt), selectedDate);
    return categoryMatch && dateMatch;
  });

  const sortedSnippets = filteredSnippets.sort((a, b) => {
    return parseCreatedAt(b.createdAt).getTime() - parseCreatedAt(a.createdAt).getTime();
  });

  const displayUserIp = (ip: string) => {
    const segments = ip.split(".");
    return segments.slice(0, 2).join(".");
  };

  const skeletonItems = Array(5)
    .fill(0)
    .map((_, index) => <SkeletonItem key={`skeleton-${index}`} />);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex-grow max-w-6xl mx-auto px-4 py-6 w-full">
        <GuideSection />

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-1.5 mb-4 flex items-center justify-between">
            <span>최근 등록된 코드</span>
            <div className="flex items-center gap-2">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                locale={ko}
                dateFormat="yyyy년 MM월 dd일"
                placeholderText="날짜 선택"
                className="block appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-1 px-2.5 rounded-md text-sm font-medium w-36"
                wrapperClassName="date-picker-wrapper"
                popperPlacement="bottom-end"
                showMonthYearPicker={false}
                dateFormatCalendar="yyyy년 M월"
              />
              <div className="relative w-36">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 py-1 px-2.5 rounded-md text-sm font-medium pr-8"
                  disabled={loading}
                >
                  <option value="전체">전체</option>
                  <option value="zip">ZIP 파일</option>
                  <option value="file">파일 및 코드</option>
                  <option value="binary">바이너리</option>
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
            </div>
          </h2>
          <style jsx global>{`
            .react-datepicker-wrapper.date-picker-wrapper {
              display: inline-block;
            }
            .react-datepicker__input-container input {
               cursor: pointer;
            }
            .react-datepicker {
              font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              border: none;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              padding: 12px;
              font-size: 12px;
            }
            .react-datepicker__header {
              background-color: white;
              border-bottom: none;
              padding: 0;
              margin-bottom: 8px;
            }
            .react-datepicker__day-names {
              margin-top: 8px;
            }
            .react-datepicker__navigation {
              top: 8px;
            }
            .react-datepicker__navigation--previous {
              left: 8px;
            }
            .react-datepicker__navigation--next {
              right: 8px;
            }
            .react-datepicker__navigation-icon::before {
              border-color: #666;
              border-width: 1.5px 1.5px 0 0;
              height: 8px;
              width: 8px;
            }
            .react-datepicker__current-month {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 8px;
              margin-top: 8px;
            }
            .react-datepicker__day-name {
              color: #999;
              font-weight: 500;
              width: 24px;
              height: 24px;
              line-height: 24px;
              margin: 2px;
              font-size: 11px;
            }
            .react-datepicker__day {
              width: 24px;
              height: 24px;
              line-height: 24px;
              margin: 2px;
              border-radius: 50%;
              color: #333;
              font-size: 12px;
            }
            .react-datepicker__day:hover {
              background-color: #f0f0f0;
              border-radius: 50%;
            }
            .react-datepicker__day--selected {
              background-color: #0ea5e9;
              border-radius: 50%;
              color: white;
            }
            .react-datepicker__day--selected:hover {
              background-color: #0284c7;
            }
            .react-datepicker__day--today {
              background-color: #eff6ff;
              color: #3b82f6;
              font-weight: normal;
            }
            .react-datepicker__day--keyboard-selected {
              background-color: #e5e7eb;
              border-radius: 50%;
            }
            .react-datepicker__day--outside-month {
              color: #ccc;
            }
          `}</style>

          {loading ? (
            <div className="divide-y divide-gray-200">{skeletonItems}</div>
          ) : sortedSnippets.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">※ {selectedDate ? `${selectedDate.toLocaleDateString('ko-KR')}에` : ''} 등록된 코드가 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedSnippets.map((snippet) => {
                let typeText = snippet.type;
                let typeClasses = "";
                if (snippet.type === "file") {
                  typeText = "파일 및 코드";
                  typeClasses = "text-yellow-600 bg-yellow-50";
                } else if (snippet.type === "zip") {
                  typeText = "ZIP 파일";
                  typeClasses = "text-green-600 bg-green-50";
                } else if (snippet.type === "binary") {
                  typeText = "바이너리";
                  typeClasses = "text-blue-500 bg-blue-50";
                }

                const createdAtDate = parseCreatedAt(snippet.createdAt);
                const formattedDate = !isNaN(createdAtDate.getTime()) 
                  ? `${createdAtDate.getFullYear()}.${String(createdAtDate.getMonth() + 1).padStart(2, '0')}.${String(createdAtDate.getDate()).padStart(2, '0')} ${String(createdAtDate.getHours()).padStart(2, '0')}:${String(createdAtDate.getMinutes()).padStart(2, '0')}`
                  : 'Invalid Date';


                return (
                  <div key={snippet.id} className="pt-3 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">
                        {displayUserIp(snippet.userIp)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formattedDate}
                      </span>
                    </div>

                    <h2 className="text-base font-semibold text-gray-800 transition-colors hover:text-blue-600 flex items-center">
                      <Link href={`/code/${snippet.id}`}>{snippet.title}  </Link>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-md font-normal ${typeClasses}`}>
                        {typeText}
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