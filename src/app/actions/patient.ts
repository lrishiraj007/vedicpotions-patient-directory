"use server"

import { getAuthSession } from "@/lib/auth-session"
import { prisma } from "@/lib/db"
import { pusherServer } from "@/lib/pusher-server"
import { z } from "zod"

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().nullable().optional(),
  sex: z.string().nullable().optional(),
  contactNo: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function createPatient(data: z.infer<typeof patientSchema>) {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Unauthorized: Authenticated session required.")
  }

  const validated = patientSchema.parse(data)

  const patient = await prisma.patient.create({
    data: {
      name: validated.name,
      age: validated.age,
      sex: validated.sex,
      contactNo: validated.contactNo,
      notes: validated.notes,
    },
  })

  return { success: true, patient }
}

export async function updatePatient(id: string, data: z.infer<typeof patientSchema>) {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Unauthorized: Authenticated session required.")
  }

  const validated = patientSchema.parse(data)

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      name: validated.name,
      age: validated.age,
      sex: validated.sex,
      contactNo: validated.contactNo,
      notes: validated.notes,
    },
  })

  return { success: true, patient }
}

export async function deletePatient(id: string) {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Unauthorized: Authenticated session required.")
  }

  if (!session.isAdmin) {
    throw new Error("Forbidden: Admin role is required to delete patient records.")
  }

  await prisma.patient.delete({
    where: { id },
  })

  try {
    await pusherServer.trigger("private-practice-updates", "mutation", {
      type: "patient_deleted",
      userId: session.user.id,
    })
  } catch (err) {
    console.error("Failed to broadcast patient deleted sync event:", err)
  }

  return { success: true }
}

export async function searchPatients(query: string) {
  const session = await getAuthSession()
  if (!session) {
    return []
  }

  if (!query || query.trim() === "") return []

  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { contactNo: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
    orderBy: {
      name: "asc",
    },
  })

  return patients
}
