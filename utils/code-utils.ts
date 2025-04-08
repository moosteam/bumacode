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
  if (name.length <= 1) return name || ""
  return name.charAt(0) + "*".repeat(name.length - 1)
}

export const getRelativeTime = (dateString: string): string => {
  return ""
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
