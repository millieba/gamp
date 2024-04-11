# Web Dashboard
## Prerequisites and dependencies
- All commands should be executed from the `web-dashboard` folder unless otherwise specified.
- Run `pnpm i` to install project dependencies.
- Make sure your system has PostgreSQL version 16 installed.
  
## Setup database
You will need to set up a local PostgreSQL 16 database to run this project.

### Create database
- I used PGAdmin4 to create the database: Servers > PostgreSQL 16 > Databases > Object > Create > Database:
	- Default options, database name: `masters_db` on default user, `postgres`
- Alternatively, you could access the PostgreSQL prompt (`psql`), ensure that you are logged in as the default user (`postgres`), and run `CREATE DATABASE masters_db;`. Verify that the database was created by running `\l`, exit with `\q`.

## Register new GitHub OAuth App
- Go to https://github.com/settings/applications/new
- Set "Homepage URL" and "Authorization callback URL" to `http://localhost:3000`
- Copy the client id and client secret, keep them somewhere safe for later.

![](img/github_reg_oauth.png)

## Create .env files
### .env
- First, create a `.env` file in the `web-dashboard` folder:
```
# Environment variables declared in this file are automatically made available to Prisma
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="postgresql://postgres:password@localhost:5432/masters_db?schema=public"
```
- Modify the code above with the correct user (default user, `postgres`), correct password (placeholder, but the password for your default user) and database name (`masters_db`).

### .env.local
- Generate a secret key using the following command in Git Bash: `openssl rand -base64 32`
- Then create a `.env.local` file in the `web-dashboard` folder where you paste the generated key along with the GitHub client secret and client id:
```
NEXTAUTH_SECRET="your-next-auth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_SECRET="client-secret-from-oauth-app-setup-on-github"
GITHUB_ID="client-id-from-oauth-app-setup-on-github"
```

## Migrate
- Run `pnpm exec prisma migrate dev`
	- This command will interpret the Prisma schema file, generate SQL commands based on it, and execute a migration to ensure our database matches the Prisma schema. It will also generate a Prisma client that matches the current schema.
	- If there were any changes in the schema file since the last migration, Prisma would create a new migration. However, since the latest migration is already pushed to Git, this command will likely just apply that existing migration to your local database.

## Seed
- Run `pnpm exec prisma db seed`
  - This command will seed the badge table of the database with badge definitions.

## Test login
- Start development server by running `pnpm dev`
- Visit http://localhost:3000/api/auth/signin. 
- A "Sign in with GitHub" button should appear. Clicking the button and signing in should redirect you to http://localhost:3000, where the heading should say e.g. "Welcome, Jane Doe!"
