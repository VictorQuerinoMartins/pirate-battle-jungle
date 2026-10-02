import { useCallback, useState } from "react";
import type { GameOptions } from "./game/core/options";
import { loadOptions, saveOptions } from "./storage/optionsStorage";
import { GameScreen } from "./ui/screens/GameScreen";
import { MenuScreen } from "./ui/screens/MenuScreen";
import { OptionsScreen } from "./ui/screens/OptionsScreen";
import { ResultScreen } from "./ui/screens/ResultScreen";
import type { MatchResult } from "./ui/matchResult";

type Screen =
  | { name: "menu" }
  | { name: "options" }
  | { name: "game" }
  | { name: "result"; result: MatchResult };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "menu" });
  const [options, setOptions] = useState<GameOptions>(() => loadOptions());

  const handleFinish = useCallback((result: MatchResult) => {
    setScreen({ name: "result", result });
  }, []);

  function handleOptionsChange(next: GameOptions) {
    setOptions(next);
    saveOptions(next);
  }

  switch (screen.name) {
    case "options":
      return (
        <OptionsScreen
          options={options}
          onChange={handleOptionsChange}
          onBack={() => setScreen({ name: "menu" })}
        />
      );
    case "game":
      return <GameScreen options={options} onFinish={handleFinish} />;
    case "result":
      return (
        <ResultScreen
          result={screen.result}
          onPlayAgain={() => setScreen({ name: "game" })}
        />
      );
    case "menu":
      return (
        <MenuScreen
          onPlay={() => setScreen({ name: "game" })}
          onOptions={() => setScreen({ name: "options" })}
        />
      );
  }
}