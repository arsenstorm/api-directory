create policy "Give users access to own folder 13v9it7_0"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'storage'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to own folder 13v9it7_1"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'storage'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



