/*
  # Add resumes storage bucket
  
  1. New Storage Bucket
    - `resumes` bucket for storing user resumes
    - Private access
    - Storage policies for authenticated users
*/

-- Create resumes storage bucket
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false);

-- Set up storage policies for resumes bucket
create policy "Users can view their own resumes"
  on storage.objects for select
  using (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload their own resumes"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own resumes"
  on storage.objects for update
  using (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own resumes"
  on storage.objects for delete
  using (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );