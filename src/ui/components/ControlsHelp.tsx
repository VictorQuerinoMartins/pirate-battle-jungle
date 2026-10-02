const CONTROLS = [
  { keys: "W / ↑", action: "Sail forward" },
  { keys: "A / ←  and  D / →", action: "Turn left and right" },
  { keys: "Space", action: "Fire the front cannon" },
  { keys: "Q / E", action: "Fire the left / right broadside" },
  { keys: "Esc / P", action: "Pause" },
];

export function ControlsHelp() {
  return (
    <section aria-labelledby="controls-title">
      <h2 id="controls-title" style={{ margin: "0 0 8px", fontSize: 20 }}>
        Controls
      </h2>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {CONTROLS.map((control) => (
          <li key={control.keys}>
            <kbd>{control.keys}</kbd> {control.action}
          </li>
        ))}
      </ul>
    </section>
  );
}