'use client'

import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { atom, useAtom } from "jotai"

const ipAtom = atom("")
const isIpVisibleAtom = atom(false)
const isLoadingAtom = atom(true)

export default function Header() {
  const [ip, setIp] = useAtom(ipAtom)
  const [isIpVisible, setIsIpVisible] = useAtom(isIpVisibleAtom)
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)

  useEffect(() => {
    if (ip === "" || isLoading) {
      const fetchIp = async () => {
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          const newIp = data.ip;

          if (newIp !== ip) {
            setIp(newIp);
          }
        } catch (error) {
          console.error("IP 주소를 가져오는 데 실패했습니다.", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchIp();
    }
  }, [ip, setIp, isLoading, setIsLoading]);

  const formatIp = (ip: string) => {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.⚹⚹⚹.⚹⚹`;
    }
    return ip;
  };

  const formattedIp = formatIp(ip);

  const handleIpClick = () => {
    setIsIpVisible(true);
    setTimeout(() => {
      setIsIpVisible(false);
    }, 3000);
  };

  const refreshIp = () => {
    setIsLoading(true);
  };

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
            <Link href="/">
              <Image
                src="/site-logo.svg"
                alt="Site Logo"
                width={20}
                height={20}
                className="object-contain"
              />
            </Link>
            <Link href="/" className="text-xl font-bold text-black ml-1 whitespace-nowrap">
              딸깍
            </Link>
          </div>

          <div className="flex items-center gap-4 text-gray-600">
            <Link
              href="/write"
              className="flex items-center gap-1 text-sm hover:text-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                <path fillRule="evenodd" d="M14.447 3.026a.75.75 0 0 1 .527.921l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.527ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
              작성하기
            </Link>

            <div
              className="hidden lg:flex items-center gap-2 text-sm cursor-pointer"
              onClick={handleIpClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-4">
                <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
              <span className="inline-flex items-center gap-2">
                {isLoading ? (
                  <>
                    내 IP · <Loader2 className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>
                    내 IP · {isIpVisible ? ip : formattedIp}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}