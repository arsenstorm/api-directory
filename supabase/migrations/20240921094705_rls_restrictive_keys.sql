drop index if exists "auth"."unique_phone_factor_per_user";

CREATE UNIQUE INDEX mfa_factors_phone_key ON auth.mfa_factors USING btree (phone);

CREATE UNIQUE INDEX unique_verified_phone_factor ON auth.mfa_factors USING btree (user_id, phone);

alter table "auth"."mfa_factors" add constraint "mfa_factors_phone_key" UNIQUE using index "mfa_factors_phone_key";


create policy "Disable Read Access"
on "public"."keys"
as restrictive
for select
to public
using (true);



