-- Leads inbox: reference-photo deletes, Instagram and notes, tighter public inserts.

alter table public.leads
  add column if not exists instagram text,
  add column if not exists notes text;

drop policy if exists "admin deletes references" on storage.objects;
create policy "admin deletes references"
on storage.objects
for delete
to authenticated
using (bucket_id = 'lead-references');

drop policy if exists "public can submit" on public.leads;
create policy "public can submit"
on public.leads
for insert
to anon
with check (
  status = 'new'
  and deposit_paid = false
  and quote_amount is null
  and notes is null
);
