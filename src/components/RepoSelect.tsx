import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import GitHubIcon from "./GitHubIcon";

interface RepoSelectProps {
  onStartSync: (owner: string, name: string, projectId: string) => void;
  onDisconnect: () => void;
}

const RepoSelect = ({ onStartSync, onDisconnect }: RepoSelectProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const parseGitHubUrl = (input: string): { owner: string; name: string } | null => {
    const trimmed = input.trim();
    const patterns = [
      /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/,
      /^github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/,
      /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/,
    ];
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return { owner: match[1], name: match[2].replace(/\.git$/, "") };
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    setError("");

    if (!url.trim()) {
      setError("הזן כתובת ריפוזיטורי.");
      return;
    }

    if (url.trim().length > 500) {
      setError("הכתובת ארוכה מדי.");
      return;
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError("כתובת לא תקינה. נסה בפורמט: github.com/user/repo");
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("sync-repo", {
        body: { owner: parsed.owner, repo: parsed.name },
      });

      if (fnError) {
        setError(`שגיאה בסנכרון: ${fnError.message}`);
        setLoading(false);
        return;
      }

      if (data?.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data?.project_id) {
        onStartSync(parsed.owner, parsed.name, data.project_id);
      }
    } catch (e) {
      setError("שגיאה בחיבור לשרת. נסה שוב.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleSubmit();
  };

  return (
    <div className="flex flex-col min-h-screen px-4">
      <header className="flex items-center justify-between py-4 max-w-2xl mx-auto w-full">
        <span className="text-sm font-semibold">מסד</span>
        <button
          onClick={onDisconnect}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          חזרה
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full -mt-16">
        <GitHubIcon className="w-8 h-8 text-muted-foreground mb-4" />
        <h1 className="text-xl font-semibold mb-1">הזן כתובת ריפוזיטורי</h1>
        <p className="text-muted-foreground text-sm mb-8">
          הדבק את הקישור לריפוזיטורי ב-GitHub.
        </p>

        <div className="w-full max-w-md">
          <input
            type="text"
            dir="ltr"
            placeholder="github.com/user/repo"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            maxLength={500}
            disabled={loading}
            className="w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono text-left disabled:opacity-50"
          />

          {error && <p className="text-destructive text-xs mt-2">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "מתחבר ל-GitHub..." : "סנכרן פרויקט"}
          </button>
        </div>

        <div className="mt-8 text-xs text-muted-foreground max-w-md text-center space-y-1">
          <p>פורמטים נתמכים:</p>
          <p dir="ltr" className="font-mono">https://github.com/user/repo</p>
          <p dir="ltr" className="font-mono">user/repo</p>
        </div>
      </div>
    </div>
  );
};

export default RepoSelect;
