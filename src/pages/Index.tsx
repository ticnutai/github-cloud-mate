import { useState, useCallback } from "react";
import ConnectScreen from "@/components/ConnectScreen";
import RepoSelect from "@/components/RepoSelect";
import SyncProgress from "@/components/SyncProgress";
import Workspace from "@/components/Workspace";

type AppState = "connect" | "select" | "sync" | "workspace";

const Index = () => {
  const [state, setState] = useState<AppState>("connect");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");

  const handleConnect = () => setState("select");

  const handleStartSync = (owner: string, name: string, projId: string) => {
    setRepoOwner(owner);
    setRepoName(name);
    setProjectId(projId);
    setState("sync");
  };

  const handleSyncComplete = useCallback(() => {
    setState("workspace");
  }, []);

  const handleDisconnect = () => {
    setProjectId(null);
    setRepoOwner("");
    setRepoName("");
    setState("connect");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {state === "connect" && <ConnectScreen onConnect={handleConnect} />}
      {state === "select" && (
        <RepoSelect
          onStartSync={handleStartSync}
          onDisconnect={handleDisconnect}
        />
      )}
      {state === "sync" && projectId && (
        <SyncProgress
          projectId={projectId}
          repoName={repoName}
          onComplete={handleSyncComplete}
        />
      )}
      {state === "workspace" && projectId && (
        <Workspace
          projectId={projectId}
          repoName={repoName}
          username={repoOwner}
          onDisconnect={handleDisconnect}
        />
      )}
    </div>
  );
};

export default Index;
