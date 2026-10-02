import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { postMatch } from "./api/matchesApi";
import { toMatchRecord } from "./api/matchRecord";
import type { GameOptions } from "./game/core/options";
import { loadOptions, saveOptions } from "./storage/optionsStorage";
import {
  addPendingMatch,
  loadPendingMatches,
  removePendingMatch,
} from "./storage/pendingMatches";
import { loadPlayerId } from "./storage/playerId";
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
  const queryClient = useQueryClient();

  const { mutate, status, variables } = useMutation({
    mutationFn: postMatch,
    retry: 2,
    onSuccess: (_saved, record) => {
      removePendingMatch(record.id);
      void queryClient.invalidateQueries({ queryKey: ["ranking"] });
      void queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });

  const handleFinish = useCallback(
    (result: MatchResult) => {
      const record = toMatchRecord(result, loadPlayerId());
      addPendingMatch(record);
      setScreen({ name: "result", result });
      mutate(record);
    },
    [mutate],
  );

  useEffect(() => {
    function sendPending() {
      for (const record of loadPendingMatches()) mutate(record);
    }
    sendPending();
    window.addEventListener("online", sendPending);
    return () => window.removeEventListener("online", sendPending);
  }, [mutate]);

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
          saveStatus={status}
          onRetry={() => {
            if (variables) mutate(variables);
          }}
          onPlayAgain={() => setScreen({ name: "game" })}
          onMainMenu={() => setScreen({ name: "menu" })}
        />
      );
    case "menu":
      return (
        <MenuScreen
          options={options}
          onPlay={() => setScreen({ name: "game" })}
          onOptions={() => setScreen({ name: "options" })}
        />
      );
  }
}