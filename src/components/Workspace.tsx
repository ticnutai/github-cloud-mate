import { Check, FileText, Settings, FolderOpen } from "lucide-react";
import GitHubIcon from "./GitHubIcon";

interface WorkspaceProps {
  repoName: string;
  username: string;
  onDisconnect: () => void;
}

const PROJECT_FILES = [
  { name: "composer.json", type: "file" },
  { name: ".env.example", type: "file" },
  { name: "routes/", type: "folder" },
  { name: "app/", type: "folder" },
  { name: "config/", type: "folder" },
  { name: "database/", type: "folder" },
  { name: "resources/", type: "folder" },
  { name: "public/", type: "folder" },
];

const Workspace = ({ repoName, username, onDisconnect }: WorkspaceProps) => {
  return (
    <div className="flex flex-col min-h-screen px-4">
      <header className="flex items-center justify-between py-4 max-w-2xl mx-auto w-full border-b border-border">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">מסד</span>
          <span className="text-xs text-muted-foreground">·</span>
          <div className="flex items-center gap-1.5 text-sm">
            <GitHubIcon className="w-3.5 h-3.5" />
            <span className="text-muted-foreground">{username}/{repoName}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-3.5 h-3.5" />
            <span>הגדרות</span>
          </button>
          <button
            onClick={onDisconnect}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            התנתק
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full py-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 bg-success/10 text-success px-2.5 py-1 rounded-md text-xs">
            <Check className="w-3.5 h-3.5" />
            <span>מסונכרן</span>
          </div>
          <span className="text-xs text-muted-foreground">עודכן לאחרונה לפני 30 שניות</span>
        </div>

        <h2 className="text-sm font-semibold mb-3">קבצי הפרויקט</h2>
        <div className="border border-border rounded-md divide-y divide-border">
          {PROJECT_FILES.map((file) => (
            <button
              key={file.name}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-right"
            >
              {file.type === "folder" ? (
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
              ) : (
                <FileText className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-mono">{file.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 border border-border rounded-md bg-secondary">
          <p className="text-sm font-semibold mb-1">סביבת הענן מוכנה</p>
          <p className="text-xs text-muted-foreground">
            הפרויקט שלך פעיל ומוכן לעריכה. שינויים יסונכרנו אוטומטית חזרה ל-GitHub.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
