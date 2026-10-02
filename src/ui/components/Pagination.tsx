interface PaginationProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, lastPage, onChange }: PaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      style={{ display: "flex", gap: 12, alignItems: "center" }}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      <span>
        Page {page} of {lastPage}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= lastPage}
      >
        Next
      </button>
    </nav>
  );
}