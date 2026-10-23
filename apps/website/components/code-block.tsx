import { getSingletonHighlighter, createJavaScriptRegexEngine } from "shiki";

interface CodeBlockProps {
  code: string;
  language: string;
}

export async function CodeBlock({ code, language }: CodeBlockProps) {
  const highlighter = await getSingletonHighlighter({
    engine: createJavaScriptRegexEngine(),
    themes: ["min-light", "min-dark"],
    langs: [language],
  });

  const html = highlighter.codeToHtml(code, {
    lang: language,
    themes: { light: "min-light", dark: "min-dark" },
    defaultColor: false,
  });

  return (
    <div className="h-full overflow-hidden rounded-lg border bg-white dark:bg-[#1f1f1f]">
      <div
        className="h-full overflow-auto p-4 text-sm [&_pre]:bg-transparent! [&_code]:bg-transparent! [&_span]:text-(--shiki-light) dark:[&_span]:text-(--shiki-dark)"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
