import "server-only"

import { createHash } from "node:crypto"
import { cookies } from "next/headers"
import type { User } from "@/payload-types"
import { getPayloadClient } from "@/lib/payload"

const APP_SESSION_COOKIE = "app-session"

function hashPin(pin: string) {
  return createHash("sha256").update(pin).digest("hex")
}

export function createAppAuth(collection: "users") {
  async function findByPin(pin: string): Promise<User | null> {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection,
      where: { pinHash: { equals: hashPin(pin) } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    return result.docs[0] ?? null
  }

  async function verifyPin(pin: string): Promise<User | null> {
    const user = await findByPin(pin)
    if (!user?.username) return null

    try {
      await (await getPayloadClient()).login({
        collection,
        data: { username: user.username, password: pin },
        overrideAccess: false,
      })
      return user
    } catch {
      return null
    }
  }

  async function login(pin: string): Promise<User | null> {
    const user = await findByPin(pin)
    if (!user?.username) return null

    try {
      const result = await (await getPayloadClient()).login({
        collection,
        data: { username: user.username, password: pin },
        overrideAccess: false,
      })
      if (!result.token) return null

      const cookieStore = await cookies()
      cookieStore.set(APP_SESSION_COOKIE, result.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 10,
      })
      return result.user ?? null
    } catch {
      return null
    }
  }

  async function currentUser(): Promise<User | null> {
    const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
    if (!token) return null

    const payload = await getPayloadClient()
    const authHeaders = new Headers({ Authorization: `JWT ${token}` })
    const { user } = await payload.auth({ headers: authHeaders })
    return user?.collection === collection ? user : null
  }

  async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete(APP_SESSION_COOKIE)
  }

  return { currentUser, login, logout, verifyPin }
}

export const appAuth = createAppAuth("users")
