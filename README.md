This is a poorly thought test of NextJS which simulates an Online version of the board game _World Domination_ . It is using Github OAuth for Auth and Postgresql as a store of data. A demo is available [here](https://world-domination-online-demo.herokuapp.com/).

## Requirements

To run you will need to set up te .env file. To run it against a local postgresql instance you could use values like

```
DATABASE_URL="postgresql://{POSTGRES-USER-NAME}:{POSTGRES-USER-PASSWORD}@localhost:5455/{POSTGRES-DB-NAME}?schema=public"
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID={GITHUB-API-CLIENT-ID}
GITHUB_CLIENT_SECRET={GITHUB-API-CLIENT-SECRET}
NEXTAUTH_SECRET={RANDOM-KEY-FOR-SIGNING}
```

## Data Seeding

I have not actually set up seed scripts for this but `npx prisma db push` should generate the database tables and something along the lines of the `seed-database.ts` should be able to generate a basic map to test with.

## Running

Ensure postgresql is accessible and run

```bash
npm run dev
```
