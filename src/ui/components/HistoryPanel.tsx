import { useState } from "react";
import { useHistory } from "../../api/queries";
import { formatTime } from "../formatTime";
import { Pagination } from "./Pagination";

export function HistoryPanel({ playerId }: { playerId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch } = useHistory(playerId, page);

  if (isPending) return <p role="status">Loading history...</p>;

  if (isError || !data) {
    return (
      <div role="alert">
        <p>Could not load your match history.</p>
        <button type="button" onClick={() => void refetch()}>
          Try again
        </button>
      </div>
    );
  }

  if (data.total === 0) return <p>You have not finished any match yet.</p>;

  const lastPage = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <section aria-label="Match history">
      <table>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Score</th>
            <th scope="col">Duration</th>
            <th scope="col">End</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((match) => (
            <tr key={match.id}>
              <td>{new Date(match.playedAt).toLocaleString()}</td>
              <td>{match.score}</td>
              <td>{formatTime(match.durationSeconds)}</td>
              <td>{match.reason === "time" ? "Time's up" : "Ship destroyed"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
    </section>
  );
}