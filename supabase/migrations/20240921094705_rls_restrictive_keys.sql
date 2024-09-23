create policy "Disable Read Access"
on "public"."keys"
as restrictive
for select
to public
using (true);