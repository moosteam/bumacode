"use client" 

import type React from "react" 
import { useState, useEffect, useRef } from "react" 
import { Upload } from "lucide-react" 
import JSZip from "jszip" 
import FileTree, { type FileNode } from "@/components/file-tree" 
import Header from "@/components/layout/header" 
import CodeHighlighter, {  
  detectLanguage,  
  detectLanguageFromExtension,  
  languageDisplayNames 
} from "@/components/highlight" 
import CodeInput from "@/components/code" 

export default function WritePage() { 
  const [title, setTitle] = useState("") 
  const [code, setCode] = useState("") 
  const [language, setLanguage] = useState("javascript") 
  const [lineNumbers, setLineNumbers] = useState<string[]>(["1"]) 
  const [fileName, setFileName] = useState<string | null>(null) 
  const [isZipMode, setIsZipMode] = useState(false) 
  const [fileTree, setFileTree] = useState<FileNode | null>(null) 
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null) 
  const [originalZipFile, setOriginalZipFile] = useState<File | Blob | null>(null) 
  const codeEditorRef = useRef<HTMLTextAreaElement>(null) as React.RefObject<HTMLTextAreaElement>
  const fileInputRef = useRef<HTMLInputElement>(null) 
  const titleInputRef = useRef<HTMLTextAreaElement>(null) 

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
      ".js", ".ts", ".tsx", ".py", ".java", ".cs", ".cpp", ".c", ".h", 
      ".hpp", ".go", ".rs", ".md", ".txt", ".json", ".html", ".css", 
      ".scss", ".xml", ".yaml", ".yml", 
    ] 

    const promises: Promise<void>[] = [] 

    zip.forEach((path, zipEntry) => { 
      if (path.startsWith("__MACOSX/") || path.split("/").some((part) => part.startsWith("."))) { 
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
      if (!current.children) current.children = [] 
      let found = current.children.find((child) => child.name === part) 
      if (!found) { 
        const newPath = current.path ? `<span class="math-inline">\{current\.path\}/</span>{part}` : part 
        const newNode: FileNode = { name: part, path: newPath, type: "directory", children: [] } 
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
      if (!current.children) current.children = [] 
      let found = current.children.find((child) => child.name === part) 
      if (!found) { 
        const newPath = current.path ? `<span class="math-inline">\{current\.path\}/</span>{part}` : part 
        const newNode: FileNode = { name: part, path: newPath, type: "directory", children: [] } 
        current.children.push(newNode) 
        found = newNode 
      } 
      current = found 
    } 
    if (!current.children) current.children = [] 
    let fileNode = current.children.find((child) => child.name === fileName) 
    if (!fileNode) { 
      const filePath = current.path ? `<span class="math-inline">\{current\.path\}/</span>{fileName}` : fileName 
      fileNode = { name: fileName, path: filePath, type: "file" } 
      current.children.push(fileNode) 
    } 
    return fileNode 
  } 

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { 
    const file = e.target.files?.[0] 
    if (!file) return 

    setFileName(file.name) 
    setTitle(file.name.split('.').slice(0, -1).join('.'))

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
      setFileTree(null) 
      setSelectedFile(null) 
      setOriginalZipFile(null) 
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
    if (node.type === "file") return node 
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
  }

  useEffect(() => { 
    if (!fileName && !isZipMode && code) { 
      const detectedLang = detectLanguage(code) 
      setLanguage(detectedLang) 
    } 

    const lines = code.split("\n") 
    const numbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => (i + 1).toString()) 
    setLineNumbers(numbers) 

    if (isZipMode && selectedFile && selectedFile.content !== code) { 
       const updateContentInTree = (node: FileNode): boolean => {
           if (node === selectedFile) {
               node.content = code;
               node.language = language;
               return true;
           }
           if (node.children) {
               for (const child of node.children) {
                   if (updateContentInTree(child)) return true;
               }
           }
           return false;
       };
       if(fileTree) {
          updateContentInTree(fileTree);
       }
    } 
  }, [code, language, fileName, isZipMode, selectedFile, fileTree]) 

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault() 
    const description = getDescriptionFromCode() 
    
    if (isZipMode) {
      console.log("ZIP Mode Submit Data:", { title, description, fileTree, originalZipFile });
    } else {
      console.log("Single File Mode Submit Data:", { title, description, code, language, fileName }); 
    }
  } 

  const handleSelectFile = (node: FileNode) => { 
    if (node.type === 'file') {
      setSelectedFile(node) 
      setCode(node.content || "") 
      setLanguage(node.language || detectLanguageFromExtension(node.name))
      setFileName(node.name)
    }
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
                 {!isZipMode && (
                   <span className="text-sm text-gray-500"> 
                   {languageDisplayNames[language] || language.charAt(0).toUpperCase() + language.slice(1)} 
                   </span> 
                 )}
                 {isZipMode && selectedFile && (
                    <span className="text-sm text-gray-500 truncate max-w-[200px]" title={selectedFile.path}>
                     {selectedFile.name} ({languageDisplayNames[language] || language.charAt(0).toUpperCase() + language.slice(1)})
                    </span>
                 )}
                <button 
                  type="button" 
                  onClick={handleUploadClick} 
                  className="text-sm text-blue-500 flex items-center gap-1" 
                > 
                  <Upload size={14} /> 
                  <span>파일 업로드</span> 
                </button> 
                <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileUpload} 
                   className="hidden" 
                   accept=".js,.ts,.tsx,.py,.java,.cs,.cpp,.c,.h,.hpp,.go,.rs,.md,.txt,.json,.html,.css,.scss,.xml,.yaml,.yml,.zip" 
                /> 
              </div> 
            </div> 

            {isZipMode ? ( 
              <div className="border rounded-lg overflow-hidden bg-gray-50"> 
                <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"> 
                  <div className="text-sm font-medium flex items-center"> 
                    <span>{fileTree?.name !== 'root' ? fileTree?.name : '파일 탐색기'}</span> 
                  </div> 
                </div> 

                <div className="flex h-[600px]">
                  <div className="w-1/3 border-r overflow-y-auto bg-gray-50 hide-scrollbar p-2"> 
                    {fileTree && <FileTree root={fileTree} onSelectFile={handleSelectFile} />} 
                  </div> 

                  <div className="w-2/3 flex flex-col overflow-hidden"> 
                    {selectedFile ? (
                        <>
                          <div className="flex border-b">
                              <div className="bg-gray-100 text-gray-500 p-4 text-right select-none font-mono text-sm sticky top-0 z-20"> 
                                {lineNumbers.map((num, i) => ( 
                                  <div key={i}>{num}</div> 
                                ))} 
                              </div> 
                                <div className="relative flex-grow h-full">
                                  <textarea 
                                    ref={codeEditorRef} 
                                    value={code} 
                                    onChange={(e) => setCode(e.target.value)} 
                                    onKeyDown={handleTabKey} 
                                    onScroll={handleScroll} 
                                    className="p-4 font-mono text-sm resize-none w-full h-full outline-none bg-transparent text-transparent caret-gray-800 absolute top-0 left-0 z-10" 
                                    placeholder="코드를 편집하세요..." 
                                    spellCheck="false" 
                                    autoCapitalize="off" 
                                    autoComplete="off" 
                                    autoCorrect="off" 
                                  />
                                <div className="p-4 h-full overflow-auto">
                                   <CodeHighlighter code={code} language={language} /> 
                               </div>
                              </div>
                          </div>
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-gray-500">
                            표시할 파일을 선택하세요.
                        </div>
                    )}
                  </div> 
                </div> 
              </div> 
            ) : ( 
              <CodeInput 
                code={code} 
                setCode={setCode} 
                lineNumbers={lineNumbers} 
                handleTabKey={handleTabKey} 
                handleScroll={handleScroll} 
                codeEditorRef={codeEditorRef} 
              />
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