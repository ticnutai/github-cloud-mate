import { useEffect, useState } from "react";
import { Check, FileText, Settings, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GitHubIcon from "./GitHubIcon";

interface WorkspaceProps {
  projectId: string;
  repoName: string;
  username: string;
  onDisconnect: () => void;
}

interface ProjectFile {
  id: string;
  file_path: string;
  file_type: string;
  status: string;
  size_bytes: number;
}

const Workspace = ({ projectId, repoName, username, onDisconnect }: WorkspaceProps) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data } = await supabase
        .from("sync_files")
        .select("id, file_path, file_type, status, size_bytes")
        .eq("project_id", projectId)
        .eq("status", "done")
        .order("file_path");

      if (data) setFiles(data);
    };
    fetchFiles();
  }, [projectId]);

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
          <span className="text-xs text-muted-foreground">{files.length} קבצים סונכרנו</span>
        </div>

        <h2 className="text-sm font-semibold mb-3">קבצי הפרויקט</h2>
        <div className="border border-border rounded-md divide-y divide-border max-h-[400px] overflow-y-auto">
          {files.map((file) => (
            <button
              key={file.id}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-right"
            >
              {file.file_type === "dir" ? (
                <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className="text-sm font-mono truncate">{file.file_path}</span>
              {file.size_bytes > 0 && (
                <span className="text-xs text-muted-foreground mr-auto">
                  {(file.size_bytes / 1024).toFixed(1)}KB
                </span>
              )}
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
