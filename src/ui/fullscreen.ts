
export function enterFullscreen(): void {
  if (!window.matchMedia("(pointer: coarse)").matches) return;
  // the tests control the page by themselves
  if (new URLSearchParams(window.location.search).has("testControls")) return;

  const root = document.documentElement;
  if (document.fullscreenElement || !root.requestFullscreen) return;
  root.requestFullscreen({ navigationUI: "hide" }).catch(() => {
    // the browser said no: the game works the same without fullscreen
  });
}