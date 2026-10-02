import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./api/queryClient";

async function enableMocks(): Promise<void> {
  try {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledFrame: "bypass",
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    });
  } catch (error) {
    console.error("Mock API unavailable", error);
  }
}

void enableMocks().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
});