"use client"

import { useState, useCallback } from "react"
import JSZip from "jszip"
import type { FileNode } from "@/components/file-tree"

export default function useFileTree() {
  const [fileTree, setFileTree] = useState<FileNode | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [originalZipFile, setOriginalZipFile] = useState<Blob | null>(null)
  const [zipInstance, setZipInstance] = useState<JSZip | null>(null)

  const loadExampleZip = useCallback(async () => {
    if (!originalZipFile) return
    try {
      const zip = await JSZip.loadAsync(originalZipFile)
      setZipInstance(zip)
      const tree: FileNode = { 
        name: "/", 
        path: "", 
        type: "directory", 
        children: [] 
      }
      Object.keys(zip.files).forEach((filePath) => {
        const zipEntry = zip.files[filePath]
        const parts = filePath.split("/").filter((p) => p)
        let currentNode = tree
        parts.forEach((part, index) => {
          const isFile = index === parts.length - 1 && !zipEntry.dir
          let child = currentNode.children?.find((node) => node.name === part)
          if (!child) {
            child = {
              name: part,
              path: currentNode.path ? `${currentNode.path}/${part}` : part,
              type: isFile ? "file" : "directory",
              children: isFile ? undefined : [],
              content: undefined,
              language: undefined
            }
            currentNode.children!.push(child)
          }
          currentNode = child
        })
      })
      setFileTree(tree)
      const findFirstFile = (node: FileNode): FileNode | null => {
        if (node.type === "file") return node
        if (node.children) {
          for (const child of node.children) {
            const found = findFirstFile(child)
            if (found) return found
          }
        }
        return null
      }
      const firstFile = findFirstFile(tree)
      if (firstFile) {
        setSelectedFile(firstFile)
      }
    } catch (err) {
      console.error("Error loading zip file:", err)
    }
  }, [originalZipFile])

  const handleDownloadZip = useCallback(() => {
    if (originalZipFile) {
      const url = URL.createObjectURL(originalZipFile)
      const a = document.createElement("a")
      a.href = url
      a.download = "project.zip"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [originalZipFile])

  const loadDummyZipBlob = useCallback(() => {
    const blob = new Blob(["dummy content"], { type: "application/zip" })
    setOriginalZipFile(blob)
  }, [])

  const getFileContent = useCallback(async (filePath: string) => {
    if (!zipInstance) return ""
    const file = zipInstance.file(filePath)
    if (file) {
      return await file.async("text")
    }
    return ""
  }, [zipInstance])

  return {
    fileTree,
    selectedFile,
    originalZipFile,
    loadExampleZip,
    handleDownloadZip,
    setSelectedFile,
    loadDummyZipBlob,
    setOriginalZipFile,
    getFileContent
  }
}
