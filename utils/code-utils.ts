export const downloadCode = (code: string, filename: string, language: string) => {
  const extensions: Record<string, string> = {
    JavaScript: "js",
    TypeScript: "ts",
    Java: "java",
    Python: "py",
    "C#": "cs",
    "C++": "cpp",
    Go: "go",
    Rust: "rs",
    Dart: "dart",
  }

  const extension = extensions[language] || "txt"
  const blob = new Blob([code], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")

  a.href = url
  a.download = `${filename}.${extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const maskName = (name: string) => {
  if (name.length <= 1) return name
  return name.charAt(0) + "*".repeat(name.length - 1)
}

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds}초 전`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays}일 전`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears}년 전`
}

export const languageColors: Record<string, string> = {
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

