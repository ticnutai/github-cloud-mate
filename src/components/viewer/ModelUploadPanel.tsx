import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Trash2, FileBox, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useViewerStore } from "@/lib/viewerStore";
import type { ModelEntry } from "@/lib/models";

interface UploadedModel {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

export default function ModelUploadPanel({ onLoadModel }: { onLoadModel: (model: ModelEntry) => void }) {
  const lang = useViewerStore((s) => s.lang);
  const [uploads, setUploads] = useState<UploadedModel[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchUploads = useCallback(async () => {
    const { data, error } = await supabase.storage.from("models").list("", {
      sortBy: { column: "created_at", order: "desc" },
    });
    if (data && !error) {
      const models = data
        .filter((f) => f.name.endsWith(".glb") || f.name.endsWith(".gltf"))
        .map((f) => ({
          name: f.name,
          url: supabase.storage.from("models").getPublicUrl(f.name).data.publicUrl,
          size: f.metadata?.size || 0,
          createdAt: f.created_at || "",
        }));
      setUploads(models);
    }
  }, []);

  useEffect(() => { fetchUploads(); }, [fetchUploads]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);
    const total = files.length;
    let done = 0;

    for (const file of Array.from(files)) {
      if (!file.name.endsWith(".glb") && !file.name.endsWith(".gltf")) continue;
      const safeName = file.name.replace(/\s+/g, "_").toLowerCase();
      await supabase.storage.from("models").upload(safeName, file, {
        cacheControl: "3600",
        upsert: true,
      });
      done++;
      setProgress(Math.round((done / total) * 100));
    }

    setUploading(false);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
    fetchUploads();
  };

  const handleDelete = async (name: string) => {
    await supabase.storage.from("models").remove([name]);
    fetchUploads();
  };

  const handleLoad = (upload: UploadedModel) => {
    const model: ModelEntry = {
      key: `uploaded-${upload.name}`,
      path: "",
      labels: { he: upload.name.replace(".glb", ""), en: upload.name.replace(".glb", "") },
      mirror: false,
      category: "uploaded",
      directUrl: upload.url,
    };
    onLoadModel(model);
  };

  const btn = "px-3 py-2 text-xs bg-secondary border border-border rounded-lg hover:bg-accent transition-colors font-medium";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className={`${btn} flex items-center gap-1.5 ${uploading ? "opacity-50" : ""}`}>
          <Upload className="w-3.5 h-3.5" />
          {lang === "he" ? "העלה קבצי GLB" : "Upload GLB Files"}
        </button>
        <button onClick={fetchUploads} className={`${btn} px-2`} title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".glb,.gltf"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {uploading && (
        <div className="w-full bg-secondary rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {uploads.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4">
          {lang === "he" ? "אין קבצים שהועלו. העלה קבצי GLB כדי להתחיל." : "No uploaded files. Upload GLB files to get started."}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
          {uploads.map((u) => (
            <div key={u.name} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 group">
              <FileBox className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <button
                onClick={() => handleLoad(u)}
                className="flex-1 text-xs text-right truncate hover:text-primary transition-colors cursor-pointer"
              >
                {u.name.replace(".glb", "").replace(".gltf", "")}
              </button>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {(u.size / (1024 * 1024)).toFixed(1)}MB
              </span>
              <button
                onClick={() => handleDelete(u.name)}
                className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-all shrink-0"
                title={lang === "he" ? "מחק" : "Delete"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
