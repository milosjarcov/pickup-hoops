import { formatWhen, shortAddress } from "../lib/format";
import { BallIcon, ChevronRightIcon, ClearIcon, SearchIcon } from "./Icons";
import Spinner from "./Spinner";

// "Today at 7:00 PM" for one run, "Today at 7:00 PM and 2 more" for several.
function nextRunText(runs) {
  if (!runs?.length) return null;
  const next = formatWhen(runs[0].starts_at);
  return runs.length === 1 ? next : `${next} and ${runs.length - 1} more`;
}

// The sidebar's home view: a search field and every court, each showing when
// its next run is. `courts` is null while the first load is in flight.
export default function CourtList({ courts, runsByCourt, query, onQueryChange, onSelect, error, onRetry }) {
  let body;
  if (error) {
    body = (
      <div className="state">
        <h3>Couldn't load courts</h3>
        <p>Check that the API is running, then try again.</p>
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  } else if (courts === null) {
    body = (
      <div className="state">
        <Spinner label="Loading courts" />
      </div>
    );
  } else if (courts.length === 0) {
    body = (
      <div className="state">
        <h3>No Results</h3>
        <p>Try a park name or a street.</p>
      </div>
    );
  } else {
    body = (
      <>
        <h2 className="section-title">Courts</h2>
        <ul className="court-list">
          {courts.map((court) => {
            const next = nextRunText(runsByCourt.get(court.id));
            return (
              <li key={court.id}>
                <button type="button" className="court-row" onClick={() => onSelect(court)}>
                  <span className="court-glyph">
                    <BallIcon />
                  </span>
                  <span className="court-text">
                    <span className="court-name">{court.name}</span>
                    <span className="court-address">{shortAddress(court.address)}</span>
                    <span className={next ? "court-next has-runs" : "court-next"}>
                      {next ?? "No runs scheduled"}
                    </span>
                  </span>
                  <ChevronRightIcon className="court-chevron" />
                </button>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div className="view view-fade">
      <div className="search">
        <SearchIcon className="search-icon" />
        <input
          type="search"
          placeholder="Search courts"
          aria-label="Search courts"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onQueryChange("")}
        />
        {query && (
          <button type="button" className="search-clear" aria-label="Clear search" onClick={() => onQueryChange("")}>
            <ClearIcon />
          </button>
        )}
      </div>
      <div className="view-scroll">{body}</div>
    </div>
  );
}
