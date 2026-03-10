-- Create projects table (public - no auth required for this demo)
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_url TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_files INTEGER DEFAULT 0,
  synced_files INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sync_files table
CREATE TABLE public.sync_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'file',
  status TEXT NOT NULL DEFAULT 'pending',
  size_bytes INTEGER DEFAULT 0,
  sha TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_files ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth for this tool)
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Anyone can create projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update projects" ON public.projects FOR UPDATE USING (true);

CREATE POLICY "Anyone can view sync files" ON public.sync_files FOR SELECT USING (true);
CREATE POLICY "Anyone can create sync files" ON public.sync_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sync files" ON public.sync_files FOR UPDATE USING (true);

-- Enable realtime for live sync status
ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sync_files_updated_at
  BEFORE UPDATE ON public.sync_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();