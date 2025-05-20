"use client"

import type React from "react"
import { useState, type FormEvent, useEffect } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import adminAxiosInstance from "../../../services/adminAxiosInstance"

interface Doctor {
  _id: string
  name: string
  qualification: string
  specialization: string
  department: string
  registerNumber: string
  gender: "male" | "female" | "other"
  age: number
  phone: string
  email: string
  status: boolean
  consultationFees: number;
}

interface EditDoctorModalProps {
  isOpen: boolean
  doctor: Doctor
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  qualification: string
  specialization: string
  department: string
  gender: "male" | "female" | "other"
  age: number
  phone: string
  email: string
  status: boolean
  consultationFees: number
}

const EditDoctorModal = ({ isOpen, doctor, onClose, onSuccess }: EditDoctorModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: doctor.name,
    qualification: doctor.qualification,
    specialization: doctor.specialization,
    department: doctor.department,
    gender: doctor.gender,
    age: doctor.age,
    phone: doctor.phone,
    email: doctor.email,
    status: doctor.status,
    consultationFees: doctor.consultationFees
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setFormData({
      name: doctor.name,
      qualification: doctor.qualification,
      specialization: doctor.specialization,
      department: doctor.department,
      gender: doctor.gender,
      age: doctor.age,
      phone: doctor.phone,
      email: doctor.email,
      status: doctor.status,
      consultationFees: doctor.consultationFees
    })
  }, [doctor])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required"
    if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required"
    if (!formData.department.trim()) newErrors.department = "Department is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.age || formData.age < 18) newErrors.age = "Age must be at least 18"
    if (formData.consultationFees < 0) newErrors.consultationFees = "Fees cannot be negative"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : name === "status" ? value === "true" : value
    }))

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await adminAxiosInstance.put(`/doctors/${doctor._id}`, formData)
      if (response.data.status) {
        onSuccess()
      } else {
        setSubmitError(response.data.message || "Failed to update doctor")
      }
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || "An error occurred while updating the doctor")
      console.error("Error updating doctor:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-auto text-gray-800 dark:text-gray-100">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">Edit Doctor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Update the doctor's information. Register Number: {doctor.registerNumber}
          </p>

          {submitError && (
            <div className="mb-4 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 border border-red-300 dark:border-red-700 px-4 py-2 rounded">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "name", label: "Full Name", type: "text", placeholder: "Dr. John Doe" },
                { id: "qualification", label: "Qualification", type: "text", placeholder: "MBBS, MD" },
                { id: "specialization", label: "Specialization", type: "text", placeholder: "Cardiology" },
                { id: "department", label: "Department", type: "text", placeholder: "ICU" },
                { id: "phone", label: "Phone Number", type: "text", placeholder: "+91 9876543210" },
                { id: "email", label: "Email Address", type: "email", placeholder: "email@domain.com" },
                { id: "consultationFees", label: "Consultation Fees", type: "number", placeholder: "₹500" },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id} className="col-span-1">
                  <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type={type}
                    name={id}
                    id={id}
                    value={formData[id as keyof FormData]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2 border ${errors[id as keyof FormData] ? "border-red-400" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors[id as keyof FormData] && <p className="mt-1 text-xs text-red-500">{errors[id as keyof FormData]}</p>}
                </div>
              ))}

              <div className="col-span-1">
                <label htmlFor="gender" className="block text-sm font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-span-1">
                <label htmlFor="age" className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  min="18"
                  value={formData.age}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.age ? "border-red-400" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age}</p>}
              </div>

              <div className="col-span-1">
                <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  id="status"
                  value={formData.status.toString()}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Active</option>
                  <option value="false">On Leave</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSubmitting ? "Updating..." : "Update Doctor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditDoctorModal
