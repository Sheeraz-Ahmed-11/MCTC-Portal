import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

let instance: Db | null = null;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // channel_binding=require can break Neon HTTP fetch on some local Node setups
  if (process.env.NODE_ENV === "development") {
    const parsed = new URL(url);
    parsed.searchParams.delete("channel_binding");
    return parsed.toString();
  }

  return url;
}

export function getDb(): Db {
  if (!instance) {
    instance = drizzle(neon(getDatabaseUrl()), { schema });
  }
  return instance;
}

/** @deprecated Use getDb() — kept for shorter imports */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

