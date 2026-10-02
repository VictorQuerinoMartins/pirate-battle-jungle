export function PauseMenu({ onResume }: { onResume: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "rgba(0, 0, 0, 0.6)",
        color: "#fff",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 36 }}>Paused</h2>
      <button
        type="button"
        onClick={onResume}
        style={{ padding: "10px 28px", fontSize: 18, cursor: "pointer" }}
      >
        Resume
      </button>
    </div>
  );
}