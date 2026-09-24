import { getSingletonHighlighter, createJavaScriptRegexEngine } from "shiki";

interface CodeBlockProps {
  code: string;
  language: string;
}

export async function CodeBlock({ code, language }: CodeBlockProps) {
  const highlighter = await getSingletonHighlighter({
    engine: createJavaScriptRegexEngine(),
    themes: ["dark-plus"],
    langs: [language],
  });
  const html = highlighter.codeToHtml(code, {
    lang: language,
    theme: "dark-plus",
  });

  return (
    <div className="rounded-lg border bg-zinc-950 overflow-hidden">
      <div
        className="p-4 overflow-x-auto text-sm [&_pre]:!bg-transparent [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
