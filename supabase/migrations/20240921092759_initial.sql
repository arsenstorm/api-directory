create type "public"."Account Status" as enum ('Active', 'Inactive', 'Suspended', 'Terminated');

create type "public"."User Role" as enum ('User', 'Administrator', 'Owner');

create table "public"."keys" (
    "id" text not null,
    "user_id" uuid not null,
    "permissions" text[] not null default '{}'::text[]
);


alter table "public"."keys" enable row level security;

create table "public"."user_details" (
    "id" uuid not null,
    "name" text,
    "avatar" text
);


alter table "public"."user_details" enable row level security;

create table "public"."users" (
    "id" uuid not null,
    "joined_at" timestamp with time zone not null default now(),
    "role" "User Role" not null default 'User'::"User Role",
    "status" "Account Status" not null default 'Active'::"Account Status",
    "email" text not null
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX keys_pkey ON public.keys USING btree (id);

CREATE UNIQUE INDEX user_details_id_key ON public.user_details USING btree (id);

CREATE UNIQUE INDEX user_details_pkey ON public.user_details USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_id_key ON public.users USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."keys" add constraint "keys_pkey" PRIMARY KEY using index "keys_pkey";

alter table "public"."user_details" add constraint "user_details_pkey" PRIMARY KEY using index "user_details_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."keys" add constraint "keys_permissions_check" CHECK ((array_length(permissions, 1) > 0)) not valid;

alter table "public"."keys" validate constraint "keys_permissions_check";

alter table "public"."keys" add constraint "keys_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."keys" validate constraint "keys_user_id_fkey";

alter table "public"."user_details" add constraint "public_user_details_id_fkey" FOREIGN KEY (id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_details" validate constraint "public_user_details_id_fkey";

alter table "public"."user_details" add constraint "user_details_id_key" UNIQUE using index "user_details_id_key";

alter table "public"."users" add constraint "public_users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "public_users_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_id_key" UNIQUE using index "users_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.insert_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (
      NEW.id,
      NEW.email
    );

    INSERT INTO public.user_details (id, name, avatar)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'avatar_url'
    );

    RETURN NEW;
END;
$function$
;

grant delete on table "public"."keys" to "anon";

grant insert on table "public"."keys" to "anon";

grant references on table "public"."keys" to "anon";

grant select on table "public"."keys" to "anon";

grant trigger on table "public"."keys" to "anon";

grant truncate on table "public"."keys" to "anon";

grant update on table "public"."keys" to "anon";

grant delete on table "public"."keys" to "authenticated";

grant insert on table "public"."keys" to "authenticated";

grant references on table "public"."keys" to "authenticated";

grant select on table "public"."keys" to "authenticated";

grant trigger on table "public"."keys" to "authenticated";

grant truncate on table "public"."keys" to "authenticated";

grant update on table "public"."keys" to "authenticated";

grant delete on table "public"."keys" to "service_role";

grant insert on table "public"."keys" to "service_role";

grant references on table "public"."keys" to "service_role";

grant select on table "public"."keys" to "service_role";

grant trigger on table "public"."keys" to "service_role";

grant truncate on table "public"."keys" to "service_role";

grant update on table "public"."keys" to "service_role";

grant delete on table "public"."user_details" to "anon";

grant insert on table "public"."user_details" to "anon";

grant references on table "public"."user_details" to "anon";

grant select on table "public"."user_details" to "anon";

grant trigger on table "public"."user_details" to "anon";

grant truncate on table "public"."user_details" to "anon";

grant update on table "public"."user_details" to "anon";

grant delete on table "public"."user_details" to "authenticated";

grant insert on table "public"."user_details" to "authenticated";

grant references on table "public"."user_details" to "authenticated";

grant select on table "public"."user_details" to "authenticated";

grant trigger on table "public"."user_details" to "authenticated";

grant truncate on table "public"."user_details" to "authenticated";

grant update on table "public"."user_details" to "authenticated";

grant delete on table "public"."user_details" to "service_role";

grant insert on table "public"."user_details" to "service_role";

grant references on table "public"."user_details" to "service_role";

grant select on table "public"."user_details" to "service_role";

grant trigger on table "public"."user_details" to "service_role";

grant truncate on table "public"."user_details" to "service_role";

grant update on table "public"."user_details" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Enable read access for all users"
on "public"."user_details"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable update for users based on email"
on "public"."user_details"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Enable read access for all users"
on "public"."users"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable update for users based on role"
on "public"."users"
as permissive
for update
to authenticated
using (((role = 'Administrator'::"User Role") OR (role = 'Owner'::"User Role")))
with check (((role = 'Administrator'::"User Role") OR (role = 'Owner'::"User Role")));

CREATE TRIGGER create_user_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION insert_user();