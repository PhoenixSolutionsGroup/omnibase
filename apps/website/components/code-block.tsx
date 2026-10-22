import { getSingletonHighlighter, createJavaScriptRegexEngine } from "shiki";

interface CodeBlockProps {
  code: string;
  language: string;
}

export async function CodeBlock({ code, language }: CodeBlockProps) {
  const highlighter = await getSingletonHighlighter({
    engine: createJavaScriptRegexEngine(),
    themes: ["min-light"],
    langs: [language],
  });

  const html = highlighter.codeToHtml(code, {
    lang: language,
    theme: "min-light",
  });

  return (
    <div className="h-full overflow-hidden rounded-lg bg-white border">
      <div
        className="h-full overflow-auto p-4 text-sm [&_pre]:!bg-transparent [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
