import { createCookieSessionStorage } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "s3cret1";
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
