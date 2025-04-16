export const languageDisplayNames: { [key: string]: string } = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  php: "PHP",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  swift: "Swift",
  kotlin: "Kotlin",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  xml: "XML",
  sql: "SQL",
  plaintext: "txt"
};

export const detectLanguageFromExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'sql': 'sql'
  };
  return languageMap[extension] || 'plaintext';
};

export const binaryExtensions = [
  '.unitypackage', '.xlsx', '.xls', '.xlsm', '.doc', '.docx', '.pdf', 
  '.ppt', '.pptx', '.odt', '.ods', '.odp', '.rtf',
  '.rar', '.7z', '.zip', '.tar', '.gz', '.bz2', '.iso', '.dmg',
  '.exe', '.dll', '.so', '.dylib', '.msi', '.deb', '.rpm', '.apk',
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg', '.webp',
  '.tiff', '.psd', '.ai', '.sketch', '.eps', '.raw', '.cr2', '.nef',
  '.mp3', '.mp4', '.wav', '.avi', '.mov', '.wmv', '.flv', '.mkv',
  '.webm', '.m4v', '.3gp', '.mpeg', '.mpg', '.vob', '.swf',
  '.stl', '.dwg', '.dxf', '.3mf', '.obj', '.fbx', '.3ds', '.max',
  '.blend', '.ma', '.mb', '.lwo', '.ply', '.gltf', '.glb',
  '.f3d', '.step', '.ipt', '.iam',
  '.db', '.sqlite', '.mdb', '.accdb', '.frm', '.myd', '.myi',
  '.vdi', '.vmdk', '.vhd', '.vhdx', '.qcow2', '.img', '.bin',
  '.dat', '.bin', '.pak', '.pak2', '.pak3', '.pak4', '.pak5',
  '.pak6', '.pak7', '.pak8', '.pak9', '.pak10', '.pak11', '.pak12',
  '.pak13', '.pak14', '.pak15', '.pak16', '.pak17', '.pak18', '.pak19',
  '.pak20', '.pak21', '.pak22', '.pak23', '.pak24', '.pak25', '.pak26',
  '.pak27', '.pak28', '.pak29', '.pak30', '.pak31', '.pak32', '.pak33',
  '.pak34', '.pak35', '.pak36', '.pak37', '.pak38', '.pak39', '.pak40',
  '.pak41', '.pak42', '.pak43', '.pak44', '.pak45', '.pak46', '.pak47',
  '.pak48', '.pak49', '.pak50'
];

export const isBinaryFileType = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  return binaryExtensions.includes(ext);
};

export const detectLanguage = (code: string): string => {
  if (code.includes('function') || code.includes('const') || code.includes('let') || code.includes('var')) {
    return 'javascript';
  }
  if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
    return 'python';
  }
  if (code.includes('public class') || code.includes('System.out.println')) {
    return 'java';
  }
  if (code.includes('<?php')) {
    return 'php';
  }
  if (code.includes('package main') || code.includes('func ')) {
    return 'go';
  }
  return 'plaintext';
}; 