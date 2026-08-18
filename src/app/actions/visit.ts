"use server"

import { getAuthSession } from "@/lib/auth-session"
import { prisma } from "@/lib/db"
import { pusherServer } from "@/lib/pusher-server"
import { z } from "zod"

const visitSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  date: z.date().or(z.string().transform(val => new Date(val))),
  location: z.string().min(1, "Location is required"),
  symptoms: z.string().nullable().optional(),
  history: z.string().nullable().optional(),
  examination: z.string().nullable().optional(),
  investigations: z.string().nullable().optional(),
  diagnosis: z.string().nullable().optional(),
  treatmentAdvised: z.string().nullable().optional(),
  paymentAmount: z.number().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

async function triggerRealtimeSync(userId: string) {
  try {
    await pusherServer.trigger("private-practice-updates", "mutation", {
      type: "visit_changed",
      userId,
    })
  } catch (err) {
    console.error("Failed to broadcast Pusher sync event:", err)
  }
}

export async function createVisit(data: z.infer<typeof visitSchema>) {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Unauthorized: Authenticated session required.")
  }

  const validated = visitSchema.parse(data)

  const visit = await prisma.visit.create({
    data: {
      patientId: validated.patientId,
      date: validated.date,
      location: validated.location,
      symptoms: validated.symptoms,
      history: validated.history,
      examination: validated.examination,
      investigations: validated.investigations,
      diagnosis: validated.diagnosis,
      treatmentAdvised: validated.treatmentAdvised,
      paymentAmount: validated.paymentAmount,
      paymentMethod: validated.paymentMethod,
      notes: validated.notes,
      createdBy: session.user.id,
    },
  })

  await triggerRealtimeSync(session.user.id)

  return { success: true, visit }
}

export async function updateVisit(id: string, data: z.infer<typeof visitSchema>) {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Unauthorized: Authenticated session required.")
  }

  const validated = visitSchema.parse(data)

  const visit = await prisma.visit.update({
    where: { id },
    data: {
      patientId: validated.patientId,
      date: validated.date,
      location: validated.location,
      symptoms: validated.symptoms,
      history: validated.history,
      examination: validated.examination,
      investigations: validated.investigations,
      diagnosis: validated.diagnosis,
      treatmentAdvised: validated.treatmentAdvised,
      paymentAmount: validated.paymentAmount,
      paymentMethod: validated.paymentMethod,
      notes: validated.notes,
    },
  })

  await triggerRealtimeSync(session.user.id)

  return { success: true, visit }
}

export async function deleteVisit(id: string) {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Unauthorized: Authenticated session required.")
  }

  // Enforce ADMIN role check
  if (!session.isAdmin) {
    throw new Error("Forbidden: Admin role is required to delete visit entries.")
  }

  await prisma.visit.delete({
    where: { id },
  })

  await triggerRealtimeSync(session.user.id)

  return { success: true }
}
