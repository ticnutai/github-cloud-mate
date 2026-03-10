import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GITHUB_PAT = Deno.env.get("GITHUB_PAT");
    if (!GITHUB_PAT) {
      throw new Error("GITHUB_PAT is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables are not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { owner, repo } = await req.json();

    if (!owner || !repo) {
      return new Response(
        JSON.stringify({ error: "owner and repo are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate owner/repo format
    const namePattern = /^[a-zA-Z0-9_.-]+$/;
    if (!namePattern.test(owner) || !namePattern.test(repo)) {
      return new Response(
        JSON.stringify({ error: "Invalid owner or repo name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify repo exists on GitHub
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "masad-sync",
      },
    });

    if (!repoRes.ok) {
      const body = await repoRes.text();
      if (repoRes.status === 404) {
        return new Response(
          JSON.stringify({ error: "Repository not found. Check the URL or your token permissions." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`GitHub API error [${repoRes.status}]: ${body}`);
    }
    await repoRes.text(); // consume

    // 2. Create project record
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        repo_url: `https://github.com/${owner}/${repo}`,
        repo_owner: owner,
        repo_name: repo,
        status: "syncing",
      })
      .select()
      .single();

    if (projectError) throw new Error(`DB error: ${projectError.message}`);

    // 3. Fetch repo tree from GitHub
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "masad-sync",
        },
      }
    );

    if (!treeRes.ok) {
      const body = await treeRes.text();
      throw new Error(`GitHub tree API error [${treeRes.status}]: ${body}`);
    }

    const treeData = await treeRes.json();
    const treeItems = treeData.tree || [];

    // 4. Insert files into sync_files (limit to first 50 for performance)
    const filesToSync = treeItems.slice(0, 50).map((item: { path: string; type: string; size?: number; sha: string }) => ({
      project_id: project.id,
      file_path: item.path,
      file_type: item.type === "tree" ? "dir" : "file",
      status: "pending",
      size_bytes: item.size || 0,
      sha: item.sha,
    }));

    if (filesToSync.length > 0) {
      const { error: filesError } = await supabase
        .from("sync_files")
        .insert(filesToSync);

      if (filesError) throw new Error(`DB files error: ${filesError.message}`);
    }

    // 5. Update project with total count
    await supabase
      .from("projects")
      .update({ total_files: filesToSync.length })
      .eq("id", project.id);

    // 6. Simulate progressive sync - update files one by one
    for (let i = 0; i < filesToSync.length; i++) {
      // Mark as syncing
      await supabase
        .from("sync_files")
        .update({ status: "syncing" })
        .eq("project_id", project.id)
        .eq("file_path", filesToSync[i].file_path);

      // Small delay for visual effect
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Mark as done
      await supabase
        .from("sync_files")
        .update({ status: "done" })
        .eq("project_id", project.id)
        .eq("file_path", filesToSync[i].file_path);

      // Update project counter
      await supabase
        .from("projects")
        .update({ synced_files: i + 1 })
        .eq("id", project.id);
    }

    // 7. Mark project as synced
    await supabase
      .from("projects")
      .update({ status: "synced" })
      .eq("id", project.id);

    return new Response(
      JSON.stringify({ success: true, project_id: project.id, files_synced: filesToSync.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Sync error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
