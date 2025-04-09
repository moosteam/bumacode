"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Upload } from "lucide-react"
import JSZip from "jszip"
import FileTree, { type FileNode } from "@/components/file-tree"
import FileViewer from "@/components/file-viewer"
import Header from "@/components/layout/header"
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const detectLanguage = (code: string): string => {
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

const detectLanguageFromExtension = (filename: string): string => {
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

const languageDisplayNames: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  python: "Python",
  csharp: "C#",
  cpp: "C++",
  go: "Go",
  rust: "Rust",
}

const getHighlightJsLanguage = (language: string): string => {
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

export default function WritePage() {
  const [title, setTitle] = useState("")
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [lineNumbers, setLineNumbers] = useState<string[]>(["1"])
  const [fileName, setFileName] = useState<string | null>(null)
  const [highlightedCode, setHighlightedCode] = useState("")
  const [isZipMode, setIsZipMode] = useState(false)
  const [fileTree, setFileTree] = useState<FileNode | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [originalZipFile, setOriginalZipFile] = useState<File | Blob | null>(null)
  const codeEditorRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLPreElement>(null)
  const titleInputRef = useRef<HTMLTextAreaElement>(null)
  const codePreviewRef = useRef<HTMLDivElement>(null)

  const getDescriptionFromCode = () => {
    if (!code) return ""
    const firstLine = code.split("\n")[0].trim()
    return firstLine
      .replace(/^\/\/\s*/, "")
      .replace(/^#\s*/, "")
      .replace(/^\/\*\s*/, "")
      .replace(/\*\/\s*$/, "")
  }

  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd

      const newCode = code.substring(0, start) + "  " + code.substring(end)
      setCode(newCode)

      setTimeout(() => {
        if (codeEditorRef.current) {
          codeEditorRef.current.selectionStart = codeEditorRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  const createFileTree = async (zip: JSZip): Promise<FileNode> => {
    const root: FileNode = {
      name: "root",
      path: "",
      type: "directory",
      children: [],
    }

    const supportedExtensions = [
      ".js",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".cs",
      ".cpp",
      ".c",
      ".h",
      ".hpp",
      ".go",
      ".rs",
      ".md",
      ".txt",
      ".json",
      ".html",
      ".css",
      ".scss",
      ".xml",
      ".yaml",
      ".yml",
    ]

    const promises: Promise<void>[] = []

    zip.forEach((path, zipEntry) => {
      if (path.startsWith("__MACOSX/")) {
        return
      }

      if (path.split("/").some((part) => part.startsWith("."))) {
        return
      }

      const pathParts = path.split("/")

      if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === "")) {
        return
      }

      if (zipEntry.dir) {
        addDirectoryToTree(root, pathParts)
      } else {
        const isSupported = supportedExtensions.some((ext) => path.toLowerCase().endsWith(ext))
        if (isSupported) {
          const promise = zipEntry.async("string").then((content) => {
            const fileNode = addFileToTree(root, pathParts)
            if (fileNode) {
              fileNode.content = content
              fileNode.language = detectLanguageFromExtension(path)
            }
          })
          promises.push(promise)
        }
      }
    })

    await Promise.all(promises)

    if (root.children && root.children.length === 1 && root.children[0].type === "directory") {
      return root.children[0]
    }

    return root
  }

  const addDirectoryToTree = (root: FileNode, pathParts: string[]): FileNode => {
    let current = root

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]
      if (!part) continue

      if (!current.children) {
        current.children = []
      }

      let found = current.children.find((child) => child.name === part)

      if (!found) {
        const newPath = current.path ? `${current.path}/${part}` : part
        const newNode: FileNode = {
          name: part,
          path: newPath,
          type: "directory",
          children: [],
        }
        current.children.push(newNode)
        found = newNode
      }

      current = found
    }

    return current
  }

  const addFileToTree = (root: FileNode, pathParts: string[]): FileNode | null => {
    if (pathParts.length === 0) return null

    const fileName = pathParts[pathParts.length - 1]
    if (!fileName) return null

    let current = root
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i]
      if (!part) continue

      if (!current.children) {
        current.children = []
      }

      let found = current.children.find((child) => child.name === part)

      if (!found) {
        const newPath = current.path ? `${current.path}/${part}` : part
        const newNode: FileNode = {
          name: part,
          path: newPath,
          type: "directory",
          children: [],
        }
        current.children.push(newNode)
        found = newNode
      }

      current = found
    }

    if (!current.children) {
      current.children = []
    }

    let fileNode = current.children.find((child) => child.name === fileName)

    if (!fileNode) {
      const filePath = current.path ? `${current.path}/${fileName}` : fileName
      fileNode = {
        name: fileName,
        path: filePath,
        type: "file",
      }
      current.children.push(fileNode)
    }

    return fileNode
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    if (file.name.toLowerCase().endsWith(".zip")) {
      try {
        setOriginalZipFile(file)

        const zipData = await file.arrayBuffer()
        const zip = await JSZip.loadAsync(zipData)

        const tree = await createFileTree(zip)
        setFileTree(tree)
        setIsZipMode(true)

        const firstFile = findFirstFile(tree)
        if (firstFile) {
          setSelectedFile(firstFile)
          setCode(firstFile.content || "")
          setLanguage(firstFile.language || "javascript")
        }
      } catch (error) {
        console.error("ZIP 파일 처리 중 오류:", error)
        alert("ZIP 파일을 처리하는 중 오류가 발생했습니다.")
      }
    } else {
      setIsZipMode(false)
      const detectedLang = detectLanguageFromExtension(file.name)
      setLanguage(detectedLang)

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setCode(content)
      }
      reader.readAsText(file)
    }
  }

  const findFirstFile = (node: FileNode): FileNode | null => {
    if (node.type === "file") {
      return node
    }

    if (node.children) {
      for (const child of node.children) {
        const found = findFirstFile(child)
        if (found) return found
      }
    }

    return null
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (previewRef.current) {
      previewRef.current.scrollTop = e.currentTarget.scrollTop
      previewRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
    
    if (codePreviewRef.current) {
      codePreviewRef.current.scrollTop = e.currentTarget.scrollTop
      codePreviewRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  useEffect(() => {
    if (!fileName && !isZipMode) {
      const detectedLang = detectLanguage(code)
      setLanguage(detectedLang)
    }

    const lines = code.split("\n")
    const numbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => (i + 1).toString())
    setLineNumbers(numbers)

    try {
      const hljsLanguage = getHighlightJsLanguage(language)
      const highlighted = hljs.highlight(code, { language: hljsLanguage }).value
      setHighlightedCode(highlighted)
    } catch (error) {
      console.error("Highlighting error:", error)
      setHighlightedCode(code)
    }

    if (isZipMode && selectedFile) {
      selectedFile.content = code
    }
  }, [code, language, fileName, isZipMode, selectedFile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const description = getDescriptionFromCode()
    console.log({ title, description, code, language })
  }

  const handleSelectFile = (node: FileNode) => {
    setSelectedFile(node)
    setCode(node.content || "")
  }

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = "auto"
      titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`
    }
  }, [title])

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-2">
            <textarea
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold border-none outline-none resize-none overflow-hidden"
              placeholder="제목을 입력하세요"
              rows={1}
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-end items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {languageDisplayNames[language] || language.charAt(0).toUpperCase() + language.slice(1)}
                </span>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="text-sm text-blue-500 flex items-center gap-1"
                >
                  <Upload size={14} />
                  <span>파일 업로드</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              </div>
            </div>

            {isZipMode ? (
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                  <div className="text-sm font-medium flex items-center">
                    <span>폴더 구조</span>
                  </div>
                </div>

                <div className="flex h-[500px]">
                  <div className="w-1/3 border-r overflow-y-auto bg-gray-50 hide-scrollbar">
                    {fileTree && <FileTree root={fileTree} onSelectFile={handleSelectFile} />}
                  </div>

                  <div className="w-2/3 overflow-hidden">
                    <FileViewer file={selectedFile} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <div className="text-sm font-medium">코드 입력</div>
                </div>
                <div className="flex">
                  <div className="bg-gray-100 text-gray-500 p-4 text-right select-none font-mono text-sm">
                    {lineNumbers.map((num, i) => (
                      <div key={i}>{num}</div>
                    ))}
                  </div>

                  <div className="relative flex-grow">
                    <textarea
                      ref={codeEditorRef}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={handleTabKey}
                      onScroll={handleScroll}
                      className="p-4 font-mono text-sm resize-none w-full h-full min-h-[300px] outline-none bg-transparent text-transparent caret-gray-800 absolute top-0 left-0 z-10"
                      placeholder="여기에 코드를 입력하세요..."
                      spellCheck="false"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                    />
                    <div 
                      ref={codePreviewRef}
                      className="p-4 font-mono text-sm w-full h-full min-h-[300px] whitespace-pre overflow-auto bg-white"
                      dangerouslySetInnerHTML={{ __html: highlightedCode || "<span class='text-gray-400'>여기에 코드를 입력하세요...</span>" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              공유하기
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}