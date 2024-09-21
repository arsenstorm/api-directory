drop policy "Enable read access for all users" on "public"."users";

alter table "public"."users" alter column "funds" set default 0.1000000000;

create policy "Enable read access for all users"
on "public"."users"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = id));



