"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, ThumbsUp, Eye } from "lucide-react"

interface CodeSnippet {
  id: number
  title: string
  description: string
  language: string
  author: string
  likes: number
  views: number
  createdAt: string
  tags: string[]
}

interface CodeCardProps {
  snippet: CodeSnippet
}

export default function CodeCard({ snippet }: CodeCardProps) {
  const [liked, setLiked] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
  }

  const languageColors: Record<string, string> = {
    JavaScript: "bg-yellow-100 text-yellow-800",
    TypeScript: "bg-blue-100 text-blue-800",
    Python: "bg-green-100 text-green-800",
    Java: "bg-red-100 text-red-800",
    Dart: "bg-cyan-100 text-cyan-800",
    "C++": "bg-purple-100 text-purple-800",
    "C#": "bg-indigo-100 text-indigo-800",
    Go: "bg-teal-100 text-teal-800",
    Rust: "bg-orange-100 text-orange-800",
    Ruby: "bg-pink-100 text-pink-800",
  }

  const languageColor = languageColors[snippet.language] || "bg-gray-100 text-gray-800"

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${languageColor}`}>{snippet.language}</span>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock size={14} className="mr-1" />
            <span>{snippet.createdAt}</span>
          </div>
        </div>

        <Link href={`/code/${snippet.id}`}>
          <h3 className="font-bold text-lg mb-2 hover:text-blue-600">{snippet.title}</h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{snippet.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {snippet.tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            by <span className="font-medium">{snippet.author}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center text-gray-500 text-sm">
              <Eye size={16} className="mr-1" />
              <span>{snippet.views}</span>
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center text-sm ${liked ? "text-blue-500" : "text-gray-500"}`}
            >
              <ThumbsUp size={16} className="mr-1" />
              <span>{liked ? snippet.likes + 1 : snippet.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

