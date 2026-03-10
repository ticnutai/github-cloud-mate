import { useState, useCallback } from "react";
import ConnectScreen from "@/components/ConnectScreen";
import RepoSelect from "@/components/RepoSelect";
import SyncProgress from "@/components/SyncProgress";
import Workspace from "@/components/Workspace";

type AppState = "connect" | "select" | "sync" | "workspace";

interface SelectedRepo {
  name: string;
  fullName: string;
}

const Index = () => {
  const [state, setState] = useState<AppState>("connect");
  const [selectedRepo, setSelectedRepo] = useState<SelectedRepo | null>(null);
  const username = "developer";

  const handleConnect = () => setState("select");

  const handleSelectRepo = (repo: { name: string; fullName: string }) => {
    setSelectedRepo(repo);
    setState("sync");
  };

  const handleSyncComplete = useCallback(() => {
    setState("workspace");
  }, []);

  const handleDisconnect = () => {
    setSelectedRepo(null);
    setState("connect");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {state === "connect" && <ConnectScreen onConnect={handleConnect} />}
      {state === "select" && (
        <RepoSelect
          onSelect={handleSelectRepo}
          onDisconnect={handleDisconnect}
        />
      )}
      {state === "sync" && selectedRepo && (
        <SyncProgress
          repoName={selectedRepo.name}
          onComplete={handleSyncComplete}
        />
      )}
      {state === "workspace" && selectedRepo && (
        <Workspace
          repoName={selectedRepo.name}
          username={username}
          onDisconnect={handleDisconnect}
        />
      )}
    </div>
  );
};

export default Index;
