"use client"

import { useState, useCallback } from "react"
import type { FileNode } from "@/components/file-tree"

export default function useFileTree() {
  const [fileTree, setFileTree] = useState<FileNode | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [originalZipFile, setOriginalZipFile] = useState<Blob | null>(null)

  const loadExampleZip = useCallback(() => {
    const exampleTree: FileNode = {
      name: "project",
      path: "project",
      type: "directory",
      children: [
        {
          name: "src",
          path: "project/src",
          type: "directory",
          children: [
            {
              name: "components",
              path: "project/src/components",
              type: "directory",
              children: [
                {
                  name: "Button.tsx",
                  path: "project/src/components/Button.tsx",
                  type: "file",
                  content: `import React from 'react';

interface ButtonProps {
  primary?: boolean;
  size?: 'small' | 'medium' | 'large';
  label: string;
  onClick?: () => void;
}

export const Button = ({
  primary = false,
  size = 'medium',
  label,
  ...props
}: ButtonProps) => {
  const baseStyle = 'rounded font-bold';
  const sizeStyle = {
    small: 'py-1 px-2 text-sm',
    medium: 'py-2 px-4 text-base',
    large: 'py-3 px-6 text-lg',
  };
  const typeStyle = primary
    ? 'bg-blue-500 text-white hover:bg-blue-600'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <button
      type="button"
      className={\`\${baseStyle} \${sizeStyle[size]} \${typeStyle}\`}
      {...props}
    >
      {label}
    </button>
  );
};`,
                  language: "typescript",
                },
                {
                  name: "Card.tsx",
                  path: "project/src/components/Card.tsx",
                  type: "file",
                  content: `import React from 'react';

interface CardProps {
  title: string;
  description: string;
  image?: string;
  children?: React.ReactNode;
}

export const Card = ({ title, description, image, children }: CardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md">
      {image && (
        <div className="w-full h-48 overflow-hidden">
          <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2">{title}</h3>
        <p className="text-gray-700 mb-4">{description}</p>
        {children}
      </div>
    </div>
  );
};`,
                  language: "typescript",
                },
              ],
            },
            {
              name: "pages",
              path: "project/src/pages",
              type: "directory",
              children: [
                {
                  name: "index.tsx",
                  path: "project/src/pages/index.tsx",
                  type: "file",
                  content: `import React from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to My App</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          title="Getting Started" 
          description="Learn how to use this application effectively."
        >
          <Button label="Learn More" primary />
        </Card>
        
        <Card 
          title="Features" 
          description="Explore all the amazing features we offer."
        >
          <Button label="Explore" />
        </Card>
        
        <Card 
          title="Documentation" 
          description="Read our comprehensive documentation."
        >
          <Button label="Read Docs" />
        </Card>
      </div>
    </div>
  );
}`,
                  language: "typescript",
                },
              ],
            },
          ],
        },
        {
          name: "README.md",
          path: "project/README.md",
          type: "file",
          content: `# My Code Project

This is a sample React project with TypeScript and Tailwind CSS.

## Getting Started

1. Clone this repository
2. Run \`npm install\`
3. Run \`npm run dev\`

## Features

- React with TypeScript
- Tailwind CSS for styling
- Component-based architecture`,
          language: "markdown",
        },
      ],
    }

    setFileTree(exampleTree)

    const firstFile = {
      name: "README.md",
      path: "project/README.md",
      type: "file" as const,
      content: `# My Code Project

This is a sample React project with TypeScript and Tailwind CSS.

## Getting Started

1. Clone this repository
2. Run \`npm install\`
3. Run \`npm run dev\`

## Features

- React with TypeScript
- Tailwind CSS for styling
- Component-based architecture`,
      language: "markdown",
    }

    setSelectedFile(firstFile)

    const blob = new Blob(["dummy content"], { type: "application/zip" })
    setOriginalZipFile(blob)
  }, [])

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

  return {
    fileTree,
    selectedFile,
    originalZipFile,
    loadExampleZip,
    handleDownloadZip,
    setSelectedFile,
  }
}

