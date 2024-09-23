create type "public"."Request Status" as enum ('pending', 'failed', 'success');

create table "public"."requests" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "timestamp" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
    "request" jsonb not null default '{}'::jsonb,
    "response" jsonb not null default '{}'::jsonb,
    "cost" numeric not null default 0.0000000000,
    "service" text not null default 'unknown'::text,
    "status" "Request Status" not null default 'pending'::"Request Status"
);


alter table "public"."requests" enable row level security;

alter table "public"."users" add column "funds" numeric not null default 0.0000000000;

CREATE UNIQUE INDEX requests_pkey ON public.requests USING btree (id);

alter table "public"."requests" add constraint "requests_pkey" PRIMARY KEY using index "requests_pkey";

alter table "public"."requests" add constraint "requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."requests" validate constraint "requests_user_id_fkey";

grant delete on table "public"."requests" to "anon";

grant insert on table "public"."requests" to "anon";

grant references on table "public"."requests" to "anon";

grant select on table "public"."requests" to "anon";

grant trigger on table "public"."requests" to "anon";

grant truncate on table "public"."requests" to "anon";

grant update on table "public"."requests" to "anon";

grant delete on table "public"."requests" to "authenticated";

grant insert on table "public"."requests" to "authenticated";

grant references on table "public"."requests" to "authenticated";

grant select on table "public"."requests" to "authenticated";

grant trigger on table "public"."requests" to "authenticated";

grant truncate on table "public"."requests" to "authenticated";

grant update on table "public"."requests" to "authenticated";

grant delete on table "public"."requests" to "service_role";

grant insert on table "public"."requests" to "service_role";

grant references on table "public"."requests" to "service_role";

grant select on table "public"."requests" to "service_role";

grant trigger on table "public"."requests" to "service_role";

grant truncate on table "public"."requests" to "service_role";

grant update on table "public"."requests" to "service_role";

create policy "Enable read access for users by id"
on "public"."requests"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));



