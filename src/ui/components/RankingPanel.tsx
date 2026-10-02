import { useState } from "react";
import { useRanking } from "../../api/queries";
import type { GameOptions } from "../../game/core/options";

export function RankingPanel({ options }: { options: GameOptions }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch } = useRanking(options, page);

  if (isPending) return <p role="status">Loading ranking...</p>;

  if (isError || !data) {
    return (
      <div role="alert">
        <p>Could not load the ranking.</p>
        <button type="button" onClick={() => void refetch()}>
          Try again
        </button>
      </div>
    );
  }

  if (data.total === 0) return <p>No matches yet for these options.</p>;

  const lastPage = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <section aria-label="Ranking">
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Player</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.position}</td>
              <td>{entry.playerId}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {lastPage}
        </span>
        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={page >= lastPage}
        >
          Next
        </button>
      </div>
    </section>
  );
}