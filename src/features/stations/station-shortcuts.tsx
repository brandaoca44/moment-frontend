import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { stations } from "./api";
export function StationShortcuts({ close }: { close: () => void }) {
  const query = useQuery({
    queryKey: ["stations", "shortcuts"],
    queryFn: () => stations("mine"),
  });
  return (
    <div className="station-shortcuts">
      <small>Suas estações</small>
      {query.data?.data.slice(0, 5).map((s) => (
        <Link
          className="app-nav-link"
          key={s.id}
          to={`/communities/${s.id}`}
          onClick={close}
        >
          {s.name}
        </Link>
      ))}
    </div>
  );
}
