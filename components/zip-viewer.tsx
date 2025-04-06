"use client"

import { useState } from "react"
import { Download, Folder } from "lucide-react"
import FileTree, { type FileNode } from "./file-tree"
import FileViewer from "./file-viewer"

interface ZipViewerProps {
  fileTree: FileNode | null
  onDownload?: () => void
}

export default function ZipViewer({ fileTree, onDownload }: ZipViewerProps) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)

  const handleSelectFile = (node: FileNode) => {
    setSelectedFile(node)
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50">
      <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
        <div className="text-sm font-medium flex items-center">
          <Folder size={16} className="mr-2" />
          <span>폴더 구조</span>
        </div>
        {onDownload && (
          <button onClick={onDownload} className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700">
            <Download size={14} />
            <span>ZIP 다운로드</span>
          </button>
        )}
      </div>

      <div className="flex h-[500px]">
        <div className="w-1/3 border-r overflow-y-auto bg-gray-50 hide-scrollbar">
          <FileTree root={fileTree} onSelectFile={handleSelectFile} />
        </div>

        <div className="w-2/3 overflow-hidden">
          <FileViewer file={selectedFile} />
        </div>
      </div>
    </div>
  )
}

