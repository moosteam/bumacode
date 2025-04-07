"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ZipViewer from "@/components/zip-viewer"
import useFileTree from "@/hooks/use-file-tree"
import Header from "@/components/layout/header"

export default function ZipExamplePage() {
  const { fileTree, loadExampleZip, handleDownloadZip } = useFileTree()

  useEffect(() => {
    loadExampleZip()
  }, [loadExampleZip])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/" className="flex items-center text-blue-500 mb-6">
          <ArrowLeft size={16} className="mr-1" />
          <span>목록으로 돌아가기</span>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Spring Boot 프로젝트 구조 (ZIP 파일)</h1>
        </div>

        <ZipViewer fileTree={fileTree} onDownload={handleDownloadZip} />
      </div>
    </div>
  )
}

