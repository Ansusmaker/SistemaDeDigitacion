import { createHash } from "node:crypto"
import type { CollectionConfig } from "payload"

const isAppUser = ({ req }: { req: { user?: { collection?: string } | null } }) =>
  req.user?.collection === "users"

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    hidden: true,
    useAsTitle: "employeeId",
  },
  auth: {
    loginWithUsername: {
      allowEmailLogin: false,
      requireEmail: false,
      requireUsername: true,
    },
    tokenExpiration: 60 * 60 * 10,
  },
  access: {
    admin: () => false,
    create: () => true,
    delete: () => false,
    read: ({ req }) =>
      isAppUser({ req }) ? { id: { equals: req.user?.id } } : false,
    update: ({ req }) =>
      isAppUser({ req }) ? { id: { equals: req.user?.id } } : false,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (!data) return data

        if (typeof data.employeeId === "string") {
          data.employeeId = data.employeeId.trim().toUpperCase()
          data.username = data.employeeId
        }

        if (typeof data.firstName === "string") data.firstName = data.firstName.trim()
        if (typeof data.lastName === "string") data.lastName = data.lastName.trim()

        if (typeof data.password === "string") {
          const code = data.password.replace(/\D/g, "")
          if (code.length !== 4 && code.length !== 6) {
            throw new Error("El código debe tener 4 o 6 dígitos.")
          }
          data.password = code
          data.pinHash = createHash("sha256").update(code).digest("hex")
          data.role = code.length === 6 ? "admin" : "mozo"
        } else if (operation === "create") {
          throw new Error("El código es obligatorio.")
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: "employeeId",
      type: "text",
      label: "ID de empleado",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "firstName",
      type: "text",
      label: "Nombre",
      required: true,
    },
    {
      name: "lastName",
      type: "text",
      label: "Apellido",
      required: true,
    },
    {
      name: "role",
      type: "select",
      label: "Rol",
      required: true,
      options: [
        { label: "Mozo", value: "mozo" },
        { label: "Administrador", value: "admin" },
      ],
    },
    {
      name: "pinHash",
      type: "text",
      hidden: true,
      required: true,
      unique: true,
      index: true,
    },
  ],
}
