This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Setup (local development)

Follow these steps to get the project running locally.

1. Install dependencies

```bash
npm ci
# or
npm install
```

2. Prepare environment

- Copy the example env file and edit as needed:

```bash
cp .env.example .env
# On Windows (PowerShell):
copy .env.example .env
```

- The default `.env` should include `DATABASE_URL="file:./data/church-management.sqlite"`. The repo is configured to keep local SQLite databases out of source control (see `.gitignore`).

3. Initialize the database (Prisma)

Run the following to push the Prisma schema to the local SQLite file and generate the client:

```bash
npm run db:push
npm run db:generate
```

If you have seed data to load:

```bash
npm run db:seed
```

4. Start the app in development mode

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

5. Helpful commands

- Run TypeScript checks:

```bash
node_modules/.bin/tsc --noEmit
```

- Run lint:

```bash
npm run lint
```

- Run the DB check script (prints row counts for key tables):

```bash
node scripts/check-db.cjs
```

6. Common troubleshooting

- "error: src refspec main does not match any" when pushing: create an initial commit locally (`git add -A && git commit -m "Initial commit"`) then `git push -u origin main`.
- If the app cannot connect to the DB, confirm the `DATABASE_URL` path in `.env` and that the SQLite file exists at that path. Restart the dev server after `.env` changes.
- If Prisma actions fail, run `npm run db:push` and check the console for errors.

If you'd like, I can add a dedicated `SETUP.md` with expanded troubleshooting and platform-specific notes (Windows, macOS, WSL). 
