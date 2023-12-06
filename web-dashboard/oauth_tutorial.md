# Tutorial for OAuth with next-auth + Prisma and PostgreSQL
## Resources
- https://youtu.be/_ER9jHiylAo?si=IpXTGD4LZ1SIXFTC
- https://github.com/hexrcs/prisma-next-auth
- https://authjs.dev/reference/adapter/prisma
- https://authjs.dev/guides/basics/refresh-token-rotation?frameworks=core#server-side
- https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens
  
## Setup database
You will need to set up a local PostgreSQL 16 database to run this project, and have an existing Next.js > 13 project.
### Create database
- I used PGAdmin4 to create the database: Servers > PostgreSQL 16 > Databases > Object > Create > Database:
	- Default options, database name: `masters_db` on default user, `postgres`
### Connect to database in VS Code
- This is so we can easily inspect the database to see that everything looks as expected. It is not really part of the "functionality", it is just helpful for development.
- Download "SQLTools" extension, search for `mtxr.sqltools`
- Make sure to also install the SQLTools PostgreSQL/Cockroach Driver, can be found by searching for `mtxr.sqltools-driver-pg`

- Click the "Add New Connection" and save a new PostgreSQL connection:
![](img/sqltools_masters_db.png)

## Setup Prisma
### Install Prisma
- `pnpm i -D prisma`
	- The `-D` flag ensures that we only install Prisma as a dev dependency
- `pnpm i @prisma/client`
### Initialise Prisma
- Run `pnpm exec prisma init`. This will generate a few files, e.g. schema file and .env file.
#### Update .env file
```
# Environment variables declared in this file are automatically made available to Prisma
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="postgresql://postgres:verySecretPasswordHere@localhost:5432/masters_db?schema=public"
```
Modified with the correct user (default user, postgres), correct password (placeholder, but let's say verySecretPasswordHere) and database name (masters_db) 
#### Update schema
- Add a User model to the Prisma schema, `web-dashboard/prisma/schema.prisma`:
```ts
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema
// Based on main schema from https://authjs.dev/reference/adapter/prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                       String  @id @default(cuid())
  userId                   String  @map("user_id")
  type                     String
  provider                 String
  providerAccountId        String  @map("provider_account_id")
  refresh_token            String? @db.Text
  refresh_token_expires_in Int?
  access_token             String? @db.Text
  expires_at               Int?
  token_type               String?
  scope                    String?
  id_token                 String? @db.Text
  session_state            String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  accounts      Account[]
  sessions      Session[]

  @@map("users")
}
```
- The code above is based on the documentation's main schema: https://authjs.dev/reference/adapter/prisma. 
- Note that The `@map` attribute is only for mapping the Prisma field name to a database column name (we use PostgreSQL which normally uses snake case). Not really necessary, but if we are following conventions we might as well.
### Create database connection singleton
Create a file, `web-dashboard/src/utils/prisma.ts` with the following contents

```ts
// Code from Prisma's documentation: https://pris.ly/d/help/next-js-best-practices
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```
### Migration
```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
```
## Register new GitHub app
- Go to https://github.com/settings/apps/new
- Set "Homepage URL" and "Callback URL" to `http://localhost:3000`
- Select the "Expire user authorization tokens" and "Request user authorization (OAuth) during installation" options, and unselect the "Active" option under the "Webhook" heading. Webhooks can be configured later.
- Grant the permissions required by your app before clicking "Create GitHub App". These permissions can be updated later, so just choose what you know you need for now.
- Copy the client id and client secret, keep them somewhere safe for later.

![](img/github_reg_app.png)

## Setup next-auth
### Install next-auth
```bash
pnpm i next-auth
```
### Create .env.local
- At the root level, create a `.env.local` file
- Create a secret using the following command in Git Bash: `openssl rand -base64 32` 
- Paste the generated key into the `.env.local` file along with the GitHub client secret and client id:
```
NEXTAUTH_SECRET=YourSecretKeyHere_NoNeedForQuotationMarksOrAnything
GITHUB_SECRET=ClientSecretFromOAuthAppSetupOnGitHub
GITHUB_ID=ClientIDFromOAuthAppSetupOnGitHub
```
- Restart dev server afterwards for good measure
### Set next-auth options
- We need to install the Prisma adapter from next-auth as well: 
```bash
pnpm i @auth/prisma-adapter
```

- Add the following file, `web-dashboard/src/app/api/auth/[...nextauth]/options.ts`:
```ts
import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from '@/utils/prisma'

export const options: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            const [github] = await prisma.account.findMany({
                where: { userId: user.id, provider: "github" },
            });
            if (!github.expires_at) return session; // Check that github.expires_at is not null before continuing

            if (github.expires_at * 1000 < Date.now()) {
                // If the access token has expired, try to refresh it
                try {
                    const response = await fetch("https://github.com/login/oauth/access_token", {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: process.env.GITHUB_ID as string,
                            client_secret: process.env.GITHUB_SECRET as string,
                            grant_type: "refresh_token",
                            refresh_token: github.refresh_token as string,
                        }),
                        method: "POST",
                    });

                    console.log("Refreshing a user access token with a refresh token:", response.status, response.statusText);

                    const resText = await response.text();
                    const resParams = new URLSearchParams(resText);
                    const resObject = Object.fromEntries(resParams);

                    console.log("Response Object:", resObject)

                    // If the expires_in is a string, parse it into an integer
                    const expiresIn = typeof resObject.expires_in === "string" ? parseInt(resObject.expires_in) : resObject.expires_in;

                    await prisma.account.update({
                        data: {
                            access_token: resObject.access_token,
                            expires_at: Math.floor(Date.now() / 1000 + expiresIn),
                            refresh_token: resObject.refresh_token ?? github.refresh_token,
                        },
                        where: {
                            provider_providerAccountId: {
                                provider: "github",
                                providerAccountId: github.providerAccountId,
                            },
                        },
                    });
                } catch (error) {
                    console.error("Error refreshing access token", error);
                    session.error = "RefreshAccessTokenError";
                }
            }
            return session;
        },
    },
}
declare module "next-auth" {
    interface Session {
        error?: "RefreshAccessTokenError"
    }
}
```

- Add the following file, `web-dashboard/src/app/api/auth/[...nextauth]/route.ts`:
```ts
import NextAuth from 'next-auth'
import { options } from './options'

const handler = NextAuth(options)

export { handler as GET, handler as POST }
```
### Display session data on home page
- In the file `web-dashboard/src/app/(dashboard)/page.tsx` add:
```tsx
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";

const HomePage = async () => {
  const session = await getServerSession(options)
  return (
    <>
      <h1 className="text-2xl">Home</h1>
      <h2 className="text-xl">Welcome, {session?.user?.name}!</h2>
    </>
  )
}

export default HomePage;
```
## Test login page
- Visit `http://localhost:3000/api/auth/signin`. A "Sign in with GitHub" button should appear. Clicking the button and signing in should redirect you to `http://localhost:3000`, where it should say e.g. "Welcome, Jane Doe!"