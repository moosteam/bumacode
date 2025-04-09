"use client"

import { useEffect, useState } from "react"
import hljs from "highlight.js"
import "highlight.js/styles/github.css"

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

export const languageDisplayNames: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  python: "Python",
  csharp: "C#",
  cpp: "C++",
  go: "Go",
  rust: "Rust",
}

export const detectLanguage = (code: string): string => {
  if (code.includes("import React") || code.includes("useState") || code.includes("function") || code.includes("=>")) {
    if (code.includes("interface") || code.includes("<T>") || code.includes(": ")) {
      return "typescript"
    }
    return "javascript"
  } else if (code.includes("public class") || code.includes("private void")) {
    return "java"
  } else if (code.includes("def ") || code.includes("import numpy") || code.includes("print(")) {
    return "python"
  } else if (code.includes("using System;") || code.includes("namespace")) {
    return "csharp"
  } else if (code.includes("#include") || code.includes("int main()")) {
    return "cpp"
  } else if (code.includes("package main") || code.includes("func")) {
    return "go"
  } else if (code.includes("fn main()") || code.includes("use std::")) {
    return "rust"
  }

  return "javascript"
}

export const detectLanguageFromExtension = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || ""

  switch (ext) {
    case "js":
      return "javascript"
    case "ts":
    case "tsx":
      return "typescript"
    case "py":
      return "python"
    case "java":
      return "java"
    case "cs":
      return "csharp"
    case "cpp":
    case "c":
    case "h":
    case "hpp":
      return "cpp"
    case "go":
      return "go"
    case "rs":
      return "rust"
    default:
      return "javascript"
  }
}

export const getHighlightJsLanguage = (language: string): string => {
  const languageMap: Record<string, string> = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    csharp: "csharp",
    cpp: "cpp",
    go: "go",
    rust: "rust",
  }
  return languageMap[language] || "plaintext"
}

interface CodeHighlighterProps {
  code: string;
  language: string;
}

export function useCodeHighlighter(code: string, language: string) {
  const [highlightedCode, setHighlightedCode] = useState<string>("")
  
  useEffect(() => {
    try {
      const hljsLanguage = getHighlightJsLanguage(language)
      const highlighted = hljs.highlight(code, { language: hljsLanguage }).value
      setHighlightedCode(highlighted)
    } catch (error) {
      console.error("Highlighting error:", error)
      setHighlightedCode(code)
    }
  }, [code, language])
  
  return highlightedCode
}

export default function CodeHighlighter({ code, language }: CodeHighlighterProps) {
  const highlightedCode = useCodeHighlighter(code, language)
  
  return (
    <div 
      className="font-mono text-sm w-full h-full whitespace-pre overflow-auto bg-white"
      dangerouslySetInnerHTML={{ 
        __html: highlightedCode || "<span class='text-gray-400'></span>" 
      }}
    />
  )
}