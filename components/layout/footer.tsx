'use client'

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t mt-12 py-6 text-sm text-center text-gray-500 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* <p className="text-gray-500">© {new Date().getFullYear()} 딸깍</p> */}
        <p className="mt-1">
          🧑‍💻 Developed by{" "}
          <Link href="https://github.com/siniseong" target="_blank" className="hover:underline text-blue-500">
            siniseong
          </Link>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          ※ 본 서비스는 사용자 개인의 책임 하에 사용되며, 불미스러운 상황에 대한 책임은 <span className="underline">전적으로 본인</span>에게 있습니다.
        </p>
      </div>
    </footer>
  )
}
