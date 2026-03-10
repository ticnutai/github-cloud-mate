import { useEffect, useState } from "react";
import { Check, Clock, ArrowUp } from "lucide-react";

interface SyncProgressProps {
  repoName: string;
  onComplete: () => void;
}

type FileStatus = "pending" | "syncing" | "done";

interface SyncFile {
  name: string;
  status: FileStatus;
}

const INITIAL_FILES: SyncFile[] = [
  { name: "composer.json", status: "pending" },
  { name: ".env.example", status: "pending" },
  { name: "routes/web.php", status: "pending" },
  { name: "app/Models/User.php", status: "pending" },
  { name: "config/database.php", status: "pending" },
  { name: "database/migrations/", status: "pending" },
  { name: "resources/views/", status: "pending" },
  { name: "public/index.php", status: "pending" },
];

const SyncProgress = ({ repoName, onComplete }: SyncProgressProps) => {
  const [files, setFiles] = useState<SyncFile[]>(INITIAL_FILES);

  useEffect(() => {
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= INITIAL_FILES.length) {
        clearInterval(interval);
        setTimeout(onComplete, 800);
        return;
      }

      const idx = currentIndex;

      // Set current to syncing
      setFiles((prev) =>
        prev.map((f, i) => (i === idx ? { ...f, status: "syncing" } : f))
      );

      // After delay, set to done
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f, i) => (i === idx ? { ...f, status: "done" } : f))
        );
      }, 400 + Math.random() * 300);

      currentIndex++;
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  const doneCount = files.filter((f) => f.status === "done").length;

  const StatusIcon = ({ status }: { status: FileStatus }) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "syncing":
        return <ArrowUp className="w-4 h-4 text-primary animate-pulse" />;
      case "done":
        return <Check className="w-4 h-4 text-success" />;
    }
  };

  const statusLabel = (status: FileStatus) => {
    switch (status) {
      case "pending": return "בתור";
      case "syncing": return "מעלה...";
      case "done": return "הושלם";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-semibold mb-1">מסנכרן {repoName}</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {doneCount}/{files.length} קבצים הושלמו
        </p>

        <div className="border border-border rounded-md divide-y divide-border">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={file.status} />
                <span className="text-sm font-mono">{file.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
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
