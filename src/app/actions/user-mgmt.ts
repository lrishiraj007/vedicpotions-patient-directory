"use server"

import { getAuthSession } from "@/lib/auth-session"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function createUser(data: { email: string; name: string; role: "ADMIN" | "DOCTOR" }) {
  const session = await getAuthSession()
  if (!session || !session.isAdmin) {
    throw new Error("Unauthorized: Admin privileges required.")
  }

  try {
    const userId = crypto.randomUUID()
    // Default initial password that can be changed by the user in settings
    const passwordHash = bcrypt.hashSync("doctor123", 10)

    const result = await prisma.user.create({
      data: {
        id: userId,
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash,
        emailVerified: true,
      },
    })
    return { success: true, result }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create user account." }
  }
}

export async function removeMember(memberId: string) {
  const session = await getAuthSession()
  if (!session || !session.isAdmin) {
    throw new Error("Unauthorized: Admin privileges required.")
  }

  if (session.user.id === memberId) {
    throw new Error("Cannot remove your own user account.")
  }

  try {
    const result = await prisma.user.delete({
      where: {
        id: memberId,
      },
    })
    return { success: true, result }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove user account." }
  }
}
