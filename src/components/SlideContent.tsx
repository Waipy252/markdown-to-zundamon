import React from "react";
import { Img, staticFile } from "remotion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as prismStyles from "react-syntax-highlighter/dist/esm/styles/prism";

type PrismStyle = Record<string, React.CSSProperties>;
const THEMES: Record<string, PrismStyle> = prismStyles as unknown as Record<string, PrismStyle>;

interface Props {
  markdown: string;
  fontFamily: string;
  codeHighlightTheme?: string;
}

export const SlideContent: React.FC<Props> = ({ markdown, fontFamily, codeHighlightTheme = "oneLight" }) => {
  const codeStyle = THEMES[codeHighlightTheme] ?? THEMES["oneLight"];

  const hasImage = /!\[.*?\]\(.*?\)/.test(markdown);
  const imageLines: string[] = [];
  const textLines: string[] = [];
  if (hasImage) {
    for (const line of markdown.split("\n")) {
      if (/!\[.*?\]\(.*?\)/.test(line)) {
        imageLines.push(line);
      } else {
        textLines.push(line);
      }
    }
  }
  const hasTextAndImage = hasImage && textLines.some((l) => l.trim().length > 0);

  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        left: 60,
        right: 60,
        bottom: 180,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          borderRadius: 24,
          padding: "48px 60px",
          fontSize: 52,
          lineHeight: 1.8,
          color: "#333",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          width: "100%",
          minHeight: "75%",
          display: "flex",
          flexDirection: hasTextAndImage ? "row" : "column",
          alignItems: hasTextAndImage ? "center" : undefined,
          gap: hasTextAndImage ? 48 : undefined,
          justifyContent: "center",
          fontFamily: `${fontFamily}, sans-serif`,
        }}
      >
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            ul: ({ children }) => (
              <ul style={{ paddingLeft: "1.5em", margin: "0 0 16px" }}>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol style={{ paddingLeft: "1.5em", margin: "0 0 16px" }}>{children}</ol>
            ),
            li: ({ children }) => (
              <li style={{ marginBottom: 8 }}>{children}</li>
            ),
            h1: ({ children }) => (
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  marginBottom: 24,
                }}
              >
                {children}
              </div>
            ),
            h2: ({ children }) => (
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 700,
                  marginBottom: 20,
                }}
              >
                {children}
              </div>
            ),
            h3: ({ children }) => (
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                {children}
              </div>
            ),
            p: ({ children }) => (
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                {children}
              </div>
            ),
            strong: ({ children }) => (
              <span style={{ fontWeight: 700, color: "#2e7d32" }}>
                {children}
              </span>
            ),
            pre: ({ children }) => <>{children}</>,
            code: ({ className, children }) => {
              const match = /language-(\w+)/.exec(className ?? "");
              if (match) {
                return (
                  <SyntaxHighlighter
                    language={match[1]}
                    style={codeStyle}
                    customStyle={{
                      borderRadius: 12,
                      fontSize: "0.75em",
                      lineHeight: 1.5,
                      marginBottom: 16,
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                );
              }
              return (
                <span
                  style={{
                    backgroundColor: "rgba(0,0,0,0.06)",
                    borderRadius: 8,
                    padding: "4px 12px",
                    fontFamily: "monospace",
                    fontSize: "0.9em",
                  }}
                >
                  {children}
                </span>
              );
            },
            img: ({ src, alt }) => (
              <Img
                src={src ? staticFile(decodeURIComponent(src)) : ""}
                alt={alt ?? ""}
                style={{
                  maxWidth: "100%",
                  maxHeight: hasTextAndImage ? 450 : 500,
                  objectFit: "contain",
                  borderRadius: 12,
                }}
              />
            ),
          }}
        >
          {hasTextAndImage ? imageLines.join("\n") : markdown}
        </Markdown>
        {hasTextAndImage && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 20 }}>{children}</div>
                ),
                h2: ({ children }) => (
                  <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 16 }}>{children}</div>
                ),
                h3: ({ children }) => (
                  <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 12 }}>{children}</div>
                ),
                p: ({ children }) => (
                  <div style={{ marginBottom: 12, fontSize: 48, lineHeight: 1.7 }}>{children}</div>
                ),
                ul: ({ children }) => (
                  <ul style={{ paddingLeft: "1.5em", margin: "0 0 12px", fontSize: 48 }}>{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ paddingLeft: "1.5em", margin: "0 0 12px", fontSize: 48 }}>{children}</ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: 6 }}>{children}</li>
                ),
                strong: ({ children }) => (
                  <span style={{ fontWeight: 700, color: "#2e7d32" }}>{children}</span>
                ),
              }}
            >
              {textLines.join("\n")}
            </Markdown>
          </div>
        )}
      </div>
    </div>
  );
};
