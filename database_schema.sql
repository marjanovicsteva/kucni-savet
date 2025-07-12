CREATE TABLE users (
  id uuid NOT NULL,
  image text NOT NULL,
  name text,
  email text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT images_user_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE chores (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying,
  assignee uuid,
  frequency character varying,
  last_done timestamp with time zone,
  CONSTRAINT chores_pkey PRIMARY KEY (id),
  CONSTRAINT chores_assignee_fkey FOREIGN KEY (assignee) REFERENCES users(id)
);
CREATE TABLE activities (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  by uuid,
  at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  "for" bigint,
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_for_fkey FOREIGN KEY ("for") REFERENCES chores(id),
  CONSTRAINT activities_by_fkey1 FOREIGN KEY (by) REFERENCES users(id)
);
CREATE TABLE alerts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  chore bigint NOT NULL,
  by uuid,
  "for" uuid,
  created timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  received timestamp with time zone,
  CONSTRAINT alerts_pkey PRIMARY KEY (id),
  CONSTRAINT alerts_chore_fkey FOREIGN KEY (chore) REFERENCES chores(id),
  CONSTRAINT alerts_by_fkey1 FOREIGN KEY (by) REFERENCES users(id),
  CONSTRAINT alerts_for_fkey1 FOREIGN KEY ("for") REFERENCES users(id)
);
CREATE TABLE tags (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  chore bigint,
  CONSTRAINT tags_pkey PRIMARY KEY (id),
  CONSTRAINT tags_chore_fkey FOREIGN KEY (chore) REFERENCES chores(id)
);
