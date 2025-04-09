import React from "react";
import Link from "next/link";
import Header from "@/components/layout/header";

const NoCode = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      <Header />
      <div className="flex-grow flex flex-col justify-center items-center p-8 text-center mb-20">
        <div className="mb-4 text-blue-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-16 h-16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">코드가 존재하지 않아요 :(</h1>
        <Link href="/" className="text-blue-600 hover:underline flex items-center">
          <span className="mr-2"></span>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NoCode;