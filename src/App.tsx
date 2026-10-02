import { useCallback, useState } from "react";
import { GameScreen } from "./ui/screens/GameScreen";
import { ResultScreen } from "./ui/screens/ResultScreen";
import type { MatchResult } from "./ui/matchResult";

type Screen = { name: "game" } | { name: "result"; result: MatchResult };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "game" });
  const handleFinish = useCallback((result: MatchResult) => {
    setScreen({ name: "result", result });
  }, []);

  if (screen.name === "result") {
    return (
      <ResultScreen
        result={screen.result}
        onPlayAgain={() => setScreen({ name: "game" })}
      />
    );
  }
  return <GameScreen onFinish={handleFinish} />;
}