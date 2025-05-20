export interface Patient {
  _id: string
  name: string
  sex: "male" | "female" | "other"
  age: number
  homeName: string
  place: string
  phone: string
  doctor: Doctor
  department: string
  consultationFees: number
  prescriptionAdded: "added" | "pending" | "not-added"
  opNumber: string
  date: string
  renewalDate?: string
}

export interface Doctor {
  _id: string
  name: string
  department: string
  consultationFees: number
  status: boolean
}

export interface MedicalRecord {
  _id: string
  doctor: Doctor
  department: string
  consultationFees: number
  date: string
  renewalDate?: string
  prescriptionAdded: "added" | "pending" | "not-added"
}
