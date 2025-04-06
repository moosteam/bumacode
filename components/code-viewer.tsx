"use client"

import { useState } from "react"
import { Copy, Check, Download } from "lucide-react"

interface CodeViewerProps {
  code: string
  language: string
  title?: string
  onDownload?: () => void
}

export default function CodeViewer({ code, language, title, onDownload }: CodeViewerProps) {
  const [copied, setCopied] = useState(false)
  const lineNumbers = code.split("\n").map((_, i) => (i + 1).toString())

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlightCode = (code: string, language: string): string => {
    if (!code) return ""

    let highlighted = code

    if (language === "JavaScript" || language.toLowerCase() === "javascript") {
      highlighted = highlighted.replace(
        /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await)\b/g,
        '<span class="text-yellow-500">$1</span>',
      )
      highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="text-green-500">$1$2$1</span>')
      highlighted = highlighted.replace(/\/\/(.*)/g, '<span class="text-gray-500">//$1</span>')
    } else if (language === "TypeScript" || language.toLowerCase() === "typescript") {
      highlighted = highlighted.replace(
        /\b(const|let|var|function|return|if|else|for|while|class|interface|type|import|export|from|async|await)\b/g,
        '<span class="text-blue-500">$1</span>',
      )
      highlighted = highlighted.replace(
        /\b(string|number|boolean|any|void|null|undefined)\b/g,
        '<span class="text-purple-400">$1</span>',
      )
      highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="text-green-500">$1$2$1</span>')
      highlighted = highlighted.replace(/\/\/(.*)/g, '<span class="text-gray-500">//$1</span>')
    } else if (language === "Python" || language.toLowerCase() === "python") {
      highlighted = highlighted.replace(
        /\b(def|class|if|else|elif|for|while|import|from|return|True|False|None)\b/g,
        '<span class="text-green-500">$1</span>',
      )
      highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="text-yellow-500">$1$2$1</span>')
      highlighted = highlighted.replace(/#(.*)/g, '<span class="text-gray-500">#$1</span>')
    } else if (language === "Java" || language.toLowerCase() === "java") {
      highlighted = highlighted.replace(
        /\b(public|private|protected|class|interface|extends|implements|return|if|else|for|while|new|static|void)\b/g,
        '<span class="text-red-500">$1</span>',
      )
      highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="text-green-500">$1$2$1</span>')
      highlighted = highlighted.replace(/\/\/(.*)/g, '<span class="text-gray-500">//$1</span>')
    }

    return highlighted
  }

  const highlightedCode = highlightCode(code, language)

  const languageColors: Record<string, string> = {
    JavaScript: "text-yellow-500",
    TypeScript: "text-blue-500",
    Java: "text-red-500",
    Python: "text-green-500",
    "C#": "text-purple-500",
    "C++": "text-pink-500",
    Go: "text-cyan-500",
    Rust: "text-orange-500",
    Dart: "text-teal-500",
  }

  const languageColor = languageColors[language] || "text-blue-500"

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50">
      <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center">
          {title && <span className="mr-2">{title}</span>}
          <span className={`font-medium ${languageColor}`}>{language}</span>
        </div>
        <div className="flex items-center gap-3">
          {onDownload && (
            <button className="text-sm flex items-center gap-1 text-blue-500 hover:text-blue-700" onClick={onDownload}>
              <Download size={16} />
              <span>다운로드</span>
            </button>
          )}
          <button
            className="text-sm flex items-center gap-1 text-blue-500 hover:text-blue-700"
            onClick={handleCopyCode}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "복사됨" : "복사하기"}</span>
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="bg-gray-100 text-gray-500 p-4 text-right select-none font-mono text-sm">
          {lineNumbers.map((num, i) => (
            <div key={i}>{num}</div>
          ))}
        </div>

        <div className="bg-white p-4 overflow-x-auto w-full hide-scrollbar">
          <pre className="font-mono text-sm text-gray-800">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

