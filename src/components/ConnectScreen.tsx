import { useNavigate } from "react-router-dom";
import GitHubIcon from "./GitHubIcon";

interface ConnectScreenProps {
  onConnect: () => void;
}

const ConnectScreen = ({ onConnect }: ConnectScreenProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2 tracking-tight">מסד</h1>
        <p className="text-muted-foreground text-sm mb-10">
          חבר את הפרויקט שלך מ-GitHub והתחל לעבוד בענן.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConnect}
            className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <GitHubIcon />
            <span>התחבר עם GitHub</span>
          </button>

          <button
            onClick={() => navigate("/viewer")}
            className="inline-flex items-center justify-center gap-3 bg-secondary text-foreground px-6 py-3 rounded-md text-sm font-semibold hover:bg-accent transition-colors border border-border"
          >
            <span>🔬</span>
            <span>Open3D Viewer</span>
          </button>
        </div>

        <p className="text-muted-foreground text-xs mt-8">
          נדרשת הרשאת קריאה לריפוזיטוריז שלך.
        </p>
      </div>
    </div>
  );
};

export default ConnectScreen;
