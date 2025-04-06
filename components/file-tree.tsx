"use client"

import { useState } from "react"
import { Folder, FolderOpen, File, ChevronRight, ChevronDown } from "lucide-react"

export interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
  content?: string
  language?: string
}

interface FileTreeNodeProps {
  node: FileNode
  depth?: number
  onSelectFile: (node: FileNode) => void
}

export function FileTreeNode({ node, depth = 0, onSelectFile }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 2)

  const toggleOpen = () => {
    if (node.type === "directory") {
      setIsOpen(!isOpen)
    }
  }

  const handleFileClick = () => {
    if (node.type === "file") {
      onSelectFile(node)
    }
  }

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer ${node.type === "file" ? "hover:text-blue-500" : ""}`}
        onClick={node.type === "directory" ? toggleOpen : handleFileClick}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.type === "directory" &&
          (isOpen ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />)}

        {node.type === "directory" &&
          (isOpen ? (
            <FolderOpen size={16} className="mr-2 text-yellow-500" />
          ) : (
            <Folder size={16} className="mr-2 text-yellow-500" />
          ))}

        {node.type === "file" && <File size={16} className="mr-2 text-gray-500" />}

        <span className={`text-sm ${node.type === "file" ? "font-mono" : "font-medium"}`}>{node.name}</span>
      </div>

      {node.type === "directory" && isOpen && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNode key={`${child.path}-${index}`} node={child} depth={depth + 1} onSelectFile={onSelectFile} />
          ))}
        </div>
      )}
    </div>
  )
}

interface FileTreeProps {
  root: FileNode | null
  onSelectFile: (node: FileNode) => void
}

export default function FileTree({ root, onSelectFile }: FileTreeProps) {
  if (!root) return null

  return (
    <div className="py-2">
      <FileTreeNode node={root} onSelectFile={onSelectFile} />
    </div>
  )
}

