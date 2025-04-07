import Link from "next/link"
import Image from "next/image"
import { User } from "lucide-react"

export default function Header() {
  return (
    <>
      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-700 py-3 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center text-white">
            <h1 className="text-sm font-light text-center">
              <span className="mr-2">📢</span>이 서비스의 목적은 오직{" "}
              <span className="underline font-bold">코드 공유</span>입니다.
            </h1>
          </div>
        </div>
      </div>

      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/site-logo.svg"
              alt="Site Logo"
              width={60}
              height={60}
              className="object-contain"
            />
            <Link href="/" className="text-xl font-bold text-black">
              부산소프트웨어마이스터고 코드 쉐어
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-500">
              <User size={20} />
              <span>로그인</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
