interface MenuScreenProps {
  onPlay: () => void;
  onOptions: () => void;
}

export function MenuScreen({ onPlay, onOptions }: MenuScreenProps) {
  const buttonStyle = { padding: "10px 28px", fontSize: 18, cursor: "pointer" };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "#102a43",
        color: "#fff",
      }}
    >
      <h1 style={{ margin: 0 }}>Pirate Battle</h1>
      <button type="button" onClick={onPlay} style={buttonStyle}>
        Play
      </button>
      <button type="button" onClick={onOptions} style={buttonStyle}>
        Options
      </button>
    </div>
  );
}