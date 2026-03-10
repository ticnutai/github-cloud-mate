import { useEffect, useState } from "react";
import { Check, Clock, ArrowUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SyncProgressProps {
  projectId: string;
  repoName: string;
  onComplete: () => void;
}

interface SyncFile {
  id: string;
  file_path: string;
  file_type: string;
  status: string;
}

const SyncProgress = ({ projectId, repoName, onComplete }: SyncProgressProps) => {
  const [files, setFiles] = useState<SyncFile[]>([]);
  const [projectStatus, setProjectStatus] = useState("syncing");

  // Fetch initial files
  useEffect(() => {
    const fetchFiles = async () => {
      const { data } = await supabase
        .from("sync_files")
        .select("id, file_path, file_type, status")
        .eq("project_id", projectId)
        .order("file_path");

      if (data) setFiles(data);
    };
    fetchFiles();
  }, [projectId]);

  // Subscribe to realtime changes on sync_files
  useEffect(() => {
    const channel = supabase
      .channel(`sync-files-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sync_files",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const updated = payload.new as SyncFile;
          setFiles((prev) =>
            prev.map((f) => (f.id === updated.id ? { ...f, status: updated.status } : f))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sync_files",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newFile = payload.new as SyncFile;
          setFiles((prev) => {
            if (prev.find((f) => f.id === newFile.id)) return prev;
            return [...prev, newFile];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Subscribe to project status changes
  useEffect(() => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          const proj = payload.new as { status: string };
          setProjectStatus(proj.status);
          if (proj.status === "synced") {
            setTimeout(onComplete, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, onComplete]);

  // Also poll project status as fallback
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("projects")
        .select("status")
        .eq("id", projectId)
        .single();

      if (data?.status === "synced" && projectStatus !== "synced") {
        setProjectStatus("synced");
        setTimeout(onComplete, 1000);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [projectId, projectStatus, onComplete]);

  const doneCount = files.filter((f) => f.status === "done").length;

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "syncing":
        return <ArrowUp className="w-4 h-4 text-primary animate-pulse" />;
      case "done":
        return <Check className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "syncing": return "מעלה...";
      case "done": return "הושלם";
      default: return "בתור";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-semibold mb-1">מסנכרן {repoName}</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {doneCount}/{files.length} קבצים הושלמו
        </p>

        <div className="border border-border rounded-md divide-y divide-border max-h-[400px] overflow-y-auto">
          {files.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              טוען קבצים...
            </div>
          )}
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusIcon status={file.status} />
                <span className="text-sm font-mono truncate">{file.file_path}</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap mr-2">
                {statusLabel(file.status)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SyncProgress;
