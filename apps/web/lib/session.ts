"use server";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = {
  user: {
    id: string;
    name: string;
  };
  token: string;
};

const secretKey = process.env.SESSION_SECRET_KEY;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: Session) {
  try {
    const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // we want the date in millisecond

    const session = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiredAt)
      .sign(encodedKey);

    (await cookies()).set("session", session, {
      httpOnly: true,
      secure: true,
      expires: expiredAt,
      sameSite: "lax",
      path: "/",
    });
  } catch (error) {
    console.error("Failed to create the session", error);
    redirect("/login");
  }
}

export async function getSession() {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) {
    return null;
  }

  try {
    const { payload } = await jwtVerify<Session>(cookie, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Failed to verify the session", error);
    redirect("/login");
  }
}

export async function deleteSession() {
  (await cookies()).delete("session");
}
