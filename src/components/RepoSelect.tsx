import { useState } from "react";
import GitHubIcon from "./GitHubIcon";

interface Repo {
  name: string;
  fullName: string;
  language: string;
  updatedAt: string;
}

interface RepoSelectProps {
  username: string;
  onSelect: (repo: Repo) => void;
  onDisconnect: () => void;
}

const MOCK_REPOS: Repo[] = [
  { name: "laravel-shop", fullName: "user/laravel-shop", language: "PHP", updatedAt: "לפני 2 שעות" },
  { name: "api-gateway", fullName: "user/api-gateway", language: "TypeScript", updatedAt: "לפני יום" },
  { name: "dashboard-ui", fullName: "user/dashboard-ui", language: "Vue", updatedAt: "לפני 3 ימים" },
  { name: "mobile-backend", fullName: "user/mobile-backend", language: "Python", updatedAt: "לפני שבוע" },
];

const RepoSelect = ({ username, onSelect, onDisconnect }: RepoSelectProps) => {
  const [search, setSearch] = useState("");

  const filtered = MOCK_REPOS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen px-4">
      <header className="flex items-center justify-between py-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 text-sm">
          <GitHubIcon className="w-4 h-4" />
          <span className="text-muted-foreground">{username}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          התנתק
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full -mt-16">
        <h1 className="text-xl font-semibold mb-1">בחר ריפוזיטורי</h1>
        <p className="text-muted-foreground text-sm mb-6">
          בחר פרויקט לסנכרון עם הענן.
        </p>

        <input
          type="text"
          placeholder="חפש ריפוזיטורי..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring mb-4 font-mono"
        />

        <div className="w-full max-w-md border border-border rounded-md divide-y divide-border">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              לא נמצאו ריפוזיטוריז.
            </div>
          )}
          {filtered.map((repo) => (
            <button
              key={repo.fullName}
              onClick={() => onSelect(repo)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors text-right"
            >
              <div>
                <div className="text-sm font-semibold">{repo.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {repo.language} · {repo.updatedAt}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">←</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepoSelect;
