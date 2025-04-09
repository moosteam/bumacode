import { getHighlighter } from "shiki"

let highlighterPromise: ReturnType<typeof getHighlighter> | null = null

export async function highlightCode(code: string, lang: string): Promise<string> {
  if (!highlighterPromise) {
    highlighterPromise = getHighlighter({ themes: ['light-plus'], langs: [lang] })
  }

  const highlighter = await highlighterPromise
  if (!highlighter.getLoadedLanguages().includes(lang as any)) {
    await highlighter.loadLanguage(lang)
  }

  return highlighter.codeToHtml(code, { lang, theme: 'light-plus' })
}
