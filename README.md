# Kucni Savet Online

INSERT_IMAGE

Application I made while living with roommates so we could manage our environment better and keep it consistently clean.

## Development

### Setting up environment

Clone this repository and run `npm install` in the newly created directory. This application depends on Supabase for backend, so you need to install that too. Supabase further depends on Docker so you need to have insta installed as well. Once you installed Docker, on macOS run `brew install supabase` and then `supabase start` inside your project root directory. You should be able to access Studio (Web GUI for managing you Supabase instance) on `http://127.0.0.1:54323` unless you specified otherwise. You can run `supabase status` to access helpful links and data.

Copy following lines to your `.env` file:

```shell
VITE_SUPABASE_URL= # this value corresponds to "API URL" from supabase status
VITE_SUPABASE_KEY= # this value corresponds to "anon key" from supabase status
```

### Setting up backend

You'll setup the whole backend using Supabase Studio. Run the SQL from `database_schema.sql` to create all the required tables (it was automatically generated with Supabase so it might not work). If it doesn't work you can replicate this database schema manually.

INSERT_IMAGE

Once you created your tables you can run `example_chores.sql` for dummy data. Keep in minda that **ALL** users and chores are managed using Supabase GUI.

### Creating a test user

Open your local Supabase Studio and under **Authentication**, click "Add user" and "Create new user". Keep "Auto Confirm User" checked. Once the user is created in Auth module, create in in `users` table too by copying ID, name and email. You can add image through the app later.

## Production

1. Create a free [Supabase account](https://supabase.com)
2. Fork this repository
3. Create GitHub Pages action workflow
4. In GitHub Pages settings setup environmental variables like in **Development** > **Setting up environment** and fill URL and KEY with data provided by Supabase Studio in the cloud.
