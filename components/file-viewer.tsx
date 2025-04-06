"use client"

import { useEffect, useState } from "react"
import { File } from "lucide-react"
import type { FileNode } from "./file-tree"

interface FileViewerProps {
  file: FileNode | null
}

export default function FileViewer({ file }: FileViewerProps) {
  const [lineNumbers, setLineNumbers] = useState<string[]>([])
  const content = file?.content || ""

  useEffect(() => {
    if (content) {
      const lines = content.split("\n")
      const numbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => (i + 1).toString())
      setLineNumbers(numbers)
    } else {
      setLineNumbers([])
    }
  }, [content])

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>파일을 선택해주세요</p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="bg-gray-100 px-3 py-1 border-b flex items-center">
        <File size={14} className="mr-2 text-gray-500" />
        <span className="text-sm font-mono">{file.name}</span>
      </div>

      <div className="h-[calc(100%-32px)] flex">
        <div className="bg-gray-100 text-gray-500 p-4 text-right select-none font-mono text-sm">
          {lineNumbers.map((num, i) => (
            <div key={i}>{num}</div>
          ))}
        </div>

        <div className="bg-white p-4 overflow-auto w-full hide-scrollbar">
          <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">{content}</pre>
        </div>
      </div>
    </div>
  )
}

