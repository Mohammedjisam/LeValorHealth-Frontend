"use client"

import type React from "react"
import { useState } from "react"
import { X, User, Phone, Home, MapPin, Loader2 } from 'lucide-react'
import { toast } from "sonner"
import type { Patient } from "../../types/patient"
import receptionistAxiosInstance from "../../services/receptionistAxiosInstance"

interface UpdatePatientModalProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedPatient: Patient) => void
}

const UpdatePatientModal = ({ patient, isOpen, onClose, onSuccess }: UpdatePatientModalProps) => {
  const [formData, setFormData] = useState({
    name: patient.name,
    age: patient.age.toString(),
    sex: patient.sex,
    phone: patient.phone,
    homeName: patient.homeName || "",
    place: patient.place || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.age || !formData.phone) {
      toast.error("Please fill all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        age: Number.parseInt(formData.age),
      }

      const response = await receptionistAxiosInstance.patch(`/patients/${patient._id}`, payload)
      onSuccess(response.data.data)
      toast.success("Patient details updated successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update patient")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Update Patient Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <User size={16} className="mr-2 text-teal-500" />
                Full Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Phone size={16} className="mr-2 text-teal-500" />
                Phone Number <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="age" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <User size={16} className="mr-2 text-teal-500" />
                Age <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="0"
                max="120"
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="sex" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <User size={16} className="mr-2 text-teal-500" />
                Sex <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="homeName" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Home size={16} className="mr-2 text-teal-500" />
                Home Name
              </label>
              <input
                type="text"
                id="homeName"
                name="homeName"
                value={formData.homeName}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="place" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <MapPin size={16} className="mr-2 text-teal-500" />
                Place/Location
              </label>
              <input
                type="text"
                id="place"
                name="place"
                value={formData.place}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-blue-500 hover:bg-teal-600 dark:bg-blue-600 dark:hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Patient"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdatePatientModal
