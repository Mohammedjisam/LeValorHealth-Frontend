"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import adminAxiosInstance from "../../../services/adminAxiosInstance"

interface AddDoctorModalProps {
  isOpen: boolean
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
}

const AddDoctorModal = ({ isOpen, onClose, onSuccess }: AddDoctorModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    qualification: "",
    specialization: "",
    department: "",
    gender: "male",
    age: 35,
    phone: "",
    email: "",
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseInt(value) : value,
    }))

    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }


// AddDoctorModal.tsx: handleSubmit()
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);
  setSubmitError(null);

  try {
    const response = await adminAxiosInstance.post("/doctors/add", formData); // ✅ Send as JSON
    if (response.data.status) {
      onSuccess();
    } else {
      setSubmitError(response.data.message || "Failed to add doctor");
    }
  } catch (error: any) {
    setSubmitError(error.response?.data?.message || "An error occurred while adding the doctor");
    console.error("Error adding doctor:", error);
  } finally {
    setIsSubmitting(false);
  }
};


  if (!isOpen) return null

  return (
<div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/10 backdrop-blur-xs flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Add New Doctor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Fill in the doctor's information. A unique register number will be generated automatically.
          </p>

          {submitError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Dr. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="col-span-1">
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  id="qualification"
                  placeholder="MD, MBBS, etc."
                  value={formData.qualification}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.qualification ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.qualification && <p className="mt-1 text-xs text-red-600">{errors.qualification}</p>}
              </div>

              <div className="col-span-1">
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  id="specialization"
                  placeholder="Cardiology, Neurology, etc."
                  value={formData.specialization}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.specialization ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.specialization && <p className="mt-1 text-xs text-red-600">{errors.specialization}</p>}
              </div>

              <div className="col-span-1">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  id="department"
                  placeholder="Cardiac Care, ICU, etc."
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.department ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department}</p>}
              </div>

              <div className="col-span-1">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-span-1">
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.age ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
              </div>

              <div className="col-span-1">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              <div className="col-span-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

            
            
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Adding..." : "Add Doctor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddDoctorModal
