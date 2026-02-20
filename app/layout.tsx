import "./globals.css";

function ThemeScript() {
  // Runs before React hydration to avoid flicker
  const code = `(() => {\n  try {\n    const saved = localStorage.getItem("theme");\n    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;\n    const theme = saved || (prefersDark ? "dark" : "light");\n    document.documentElement.setAttribute("data-theme", theme);\n  } catch (e) {}\n})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
