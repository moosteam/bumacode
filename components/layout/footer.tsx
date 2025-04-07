'use client'

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t mt-12 py-6 text-sm text-center text-gray-500 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <p>© {new Date().getFullYear()} 딸깍</p>
        <p className="mt-1">
          Developed by{" "}
          <Link href="https://github.com/siniseong" target="_blank" className="hover:underline text-blue-500">
            siniseong
          </Link>
        </p>
      </div>
    </footer>
  )
}