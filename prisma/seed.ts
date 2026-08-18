import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') })

import fs from 'fs'

let prismaClient: any = null

async function main() {
  console.log('Seeding database with Better Auth schema...')
  const { prisma } = await import('../src/lib/db')
  const { auth } = await import('../src/lib/auth')
  prismaClient = prisma

  // Clear existing credentials records for a clean run
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const adminEmail = 'rishi@practice.com'
  const doctorEmail = 'doctor@practice.com'

  // Seed Admin User via Better Auth API (hashes password correctly)
  console.log('Signing up ADMIN user...')
  await auth.api.signUpEmail({
    body: {
      email: adminEmail,
      password: 'admin123',
      name: 'Rishi',
    }
  })

  // Update role to ADMIN
  const adminUser = await prisma.user.update({
    where: { email: adminEmail },
    data: { role: 'ADMIN' }
  })
  console.log('Seeded ADMIN user with role ADMIN:', adminUser.email)

  // Seed Doctor User via Better Auth API
  console.log('Signing up DOCTOR user...')
  await auth.api.signUpEmail({
    body: {
      email: doctorEmail,
      password: 'doctor123',
      name: 'Doctor Wife',
    }
  })

  // Update role to DOCTOR (is default but set explicitly)
  const doctorUser = await prisma.user.update({
    where: { email: doctorEmail },
    data: { role: 'DOCTOR' }
  })
  console.log('Seeded DOCTOR user with role DOCTOR:', doctorUser.email)

  // Seed patient/visit JSON data if present
  const seedJsonPath = process.env.SEED_JSON_PATH || path.join(process.cwd(), 'seed-data.json')
  if (fs.existsSync(seedJsonPath)) {
    console.log(`Found seed JSON at ${seedJsonPath}. Parsing and importing...`)
    const rawData = fs.readFileSync(seedJsonPath, 'utf-8')
    const records = JSON.parse(rawData)

    if (Array.isArray(records)) {
      let importedPatientsCount = 0
      let importedVisitsCount = 0

      for (const record of records) {
        let patientName = (record.patientName || record.name || '').trim()
        let age = record.patientAge !== undefined ? record.patientAge : (record.age !== undefined ? record.age : null)
        let sex = record.patientSex || record.sex || null
        let contactNo = record.patientContactNo || record.contactNo || null
        let notes = record.patientNotes || record.notes || null

        if (typeof age === 'string') {
          age = parseInt(age, 10) || null
        }

        if (!patientName) continue

        let patient = await prisma.patient.findFirst({
          where: {
            name: {
              equals: patientName,
              mode: 'insensitive',
            },
          },
        })

        if (!patient) {
          patient = await prisma.patient.create({
            data: {
              name: patientName,
              age,
              sex,
              contactNo: contactNo ? String(contactNo) : null,
              notes,
            },
          })
          importedPatientsCount++
        }

        let visitsData = Array.isArray(record.visits) ? record.visits : [record]

        for (const visit of visitsData) {
          await prisma.visit.create({
            data: {
              patientId: patient.id,
              date: visit.date ? new Date(visit.date) : new Date(),
              location: visit.location || 'Andheri',
              symptoms: visit.symptoms || null,
              history: visit.history || null,
              examination: visit.examination || null,
              investigations: visit.investigations || null,
              diagnosis: visit.diagnosis || null,
              treatmentAdvised: visit.treatmentAdvised || null,
              paymentAmount: visit.paymentAmount !== undefined ? (typeof visit.paymentAmount === 'string' ? parseInt(visit.paymentAmount, 10) : visit.paymentAmount) : null,
              paymentMethod: visit.paymentMethod || 'Not Paid',
              notes: visit.notes || null,
              createdBy: doctorUser.id,
            },
          })
          importedVisitsCount++
        }
      }
      console.log(`Imported ${importedPatientsCount} patients and ${importedVisitsCount} visits.`)
    }
  }
}

main()
  .catch(async (e) => {
    console.error('An error occurred while running the seed command:', e)
    process.exit(1)
  })
  .finally(async () => {
    if (prismaClient) {
      await prismaClient.$disconnect()
    }
  })
