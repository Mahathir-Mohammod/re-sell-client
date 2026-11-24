"use client";

// Only reached when the root layout itself throws, so it must render <html>/<body>.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>ReSell Hub could not start</h1>
        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
          Something failed while rendering the app shell.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            background: "#059669",
            color: "white",
            border: 0,
            borderRadius: "0.75rem",
            padding: "0.75rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        {error?.digest && (
          <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#94a3b8" }}>Reference: {error.digest}</p>
        )}
      </body>
    </html>
  );
}
