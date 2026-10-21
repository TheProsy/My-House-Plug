"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", margin: 0 }}>
          Something broke on our side
        </h1>
        <p style={{ margin: 0, maxWidth: "24rem", lineHeight: 1.6 }}>
          The page failed to load. Try again, or come back in a moment.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "9999px",
            border: "none",
            padding: "0.625rem 1.25rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
