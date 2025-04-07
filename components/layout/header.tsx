import Link from "next/link"
import Image from "next/image"

export default function Header() {
  const ip = "192.168.1.1";
  const formattedIp = ip.split('.').join(' . ');

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
              width={20}
              height={20}
              className="object-contain"
            />
            <Link href="/" className="text-xl font-bold text-black ml-2">
              딸깍
            </Link>
          </div>

          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
              <span>{formattedIp}</span>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
