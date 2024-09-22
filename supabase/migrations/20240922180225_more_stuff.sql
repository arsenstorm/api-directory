drop policy "Disable Read Access" on "public"."keys";

alter table "public"."requests" add column "encrypted" boolean not null default false;

create policy "Enable read access by id"
on "public"."keys"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));



