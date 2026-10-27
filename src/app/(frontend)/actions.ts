"use server"

import { createHash } from "node:crypto"
import { appAuth } from "@/lib/app-auth"
import { getPayloadClient } from "@/lib/payload"

type ActionResult = {
  success: boolean
  message?: string
  user?: {
    id: string
    firstName: string
    lastName: string
    role: "mozo" | "admin"
  }
}

const normalizeCode = (value: unknown) =>
  typeof value === "string" ? value.replace(/\D/g, "") : ""

const cleanText = (value: unknown) =>
  typeof value === "string" ? value.trim() : ""

export async function registerUserAction(input: {
  employeeId: string
  firstName: string
  lastName: string
  code: string
}): Promise<ActionResult> {
  const employeeId = cleanText(input.employeeId).toUpperCase()
  const firstName = cleanText(input.firstName)
  const lastName = cleanText(input.lastName)
  const code = normalizeCode(input.code)

  if (!employeeId || !firstName || !lastName) {
    return { success: false, message: "Completa todos los campos." }
  }
  if (!/^[A-Z0-9-]{2,24}$/.test(employeeId)) {
    return {
      success: false,
      message: "El ID debe tener entre 2 y 24 letras, números o guiones.",
    }
  }
  if (code.length !== 4 && code.length !== 6) {
    return { success: false, message: "El código debe tener 4 o 6 dígitos." }
  }

  const payload = await getPayloadClient()
  const pinHash = createHash("sha256").update(code).digest("hex")
  const existing = await payload.find({
    collection: "users",
    where: {
      or: [
        { employeeId: { equals: employeeId } },
        { pinHash: { equals: pinHash } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0) {
    return {
      success: false,
      message: "El ID o código ya está registrado. Usa datos diferentes.",
    }
  }

  try {
    await payload.create({
      collection: "users",
      data: {
        employeeId,
        firstName,
        lastName,
        username: employeeId,
        password: code,
        role: code.length === 6 ? "admin" : "mozo",
        pinHash,
      },
      overrideAccess: false,
    })
    return {
      success: true,
      message: `Usuario registrado como ${code.length === 6 ? "Administrador" : "Mozo"}.`,
    }
  } catch {
    return {
      success: false,
      message: "No se pudo registrar el usuario. Revisa los datos e inténtalo nuevamente.",
    }
  }
}

export async function loginAction(codeInput: string): Promise<ActionResult> {
  const code = normalizeCode(codeInput)
  if (code.length !== 4 && code.length !== 6) {
    return { success: false, message: "Código incorrecto" }
  }

  const user = await appAuth.login(code)
  if (!user) return { success: false, message: "Código incorrecto" }

  return {
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  }
}

export async function authorizeAdminAction(codeInput: string): Promise<ActionResult> {
  const code = normalizeCode(codeInput)
  if (code.length !== 6) {
    return { success: false, message: "PIN de administrador incorrecto" }
  }
  const user = await appAuth.verifyPin(code)
  if (!user || user.role !== "admin") {
    return { success: false, message: "PIN de administrador incorrecto" }
  }
  return { success: true }
}

export async function logoutAction() {
  await appAuth.logout()
}
