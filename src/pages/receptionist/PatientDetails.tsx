"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, FileText, User, Phone, Plus, ChevronDown, ChevronUp, Sun, Moon } from "lucide-react"
import { toast } from "sonner"
import type { Patient, MedicalRecord } from "../../types/patient"
import UpdatePatientModal from "../../components/receptionist/UpdatePatientModal"
import NewAppointmentModal from "../../components/receptionist/NewAppointmentModal"
import receptionistAxiosInstance from "../../services/receptionistAxiosInstance"

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [showMedicalRecords, setShowMedicalRecords] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Check for user's preferred color scheme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme) {
        setDarkMode(savedTheme === "dark")
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        setDarkMode(prefersDark)
      }
    }
  }, [])

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  useEffect(() => {
    if (id) {
      fetchPatientDetails(id)
    }
  }, [id])

  const fetchPatientDetails = async (patientId: string) => {
    setIsLoading(true)
    try {
      const response = await receptionistAxiosInstance.get(`/patients/${patientId}`)
      const patientData = response.data?.data
      setPatient(patientData)

      if (patientData?.opNumber) {
        const historyResponse = await receptionistAxiosInstance.get(`/patients/history/${patientData.opNumber}`)
        setMedicalHistory(historyResponse.data?.data || [])
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch patient details")
      navigate("/patients")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSuccess = (updatedPatient: Patient) => {
    setPatient(updatedPatient)
    setIsUpdateModalOpen(false)
    toast.success("Patient details updated successfully")
  }

  const handleAppointmentSuccess = (data: any) => {
    // Refresh medical history after adding a new appointment
    if (patient?.opNumber) {
      receptionistAxiosInstance
        .get(`/patients/history/${patient.opNumber}`)
        .then((response) => {
          setMedicalHistory(response.data?.data || [])
          toast.success("New appointment added successfully")
        })
        .catch((error) => {
          console.error("Failed to refresh medical history:", error)
        })
    }
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(-1) // Go back to previous page without reload
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 dark:border-teal-400"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-10 dark:bg-gray-900 dark:text-gray-300">
        <p className="text-gray-500 dark:text-gray-400">Patient not found.</p>
        <a
          href="/patients"
          onClick={handleBackClick}
          className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 mt-4 inline-block"
        >
          Back to Patients
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <a
          href="/patients"
          onClick={handleBackClick}
          className="flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Patients</span>
        </a>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-teal-600 dark:text-teal-400">
                Patient: <span className="text-gray-900 dark:text-gray-100">{patient.name}</span>
              </h1>
              {patient.prescriptionAdded === "added" && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium px-2.5 py-0.5 rounded w-fit">
                  Prescription Added
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400">OP Number: {patient.opNumber}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setIsAppointmentModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus size={18} />
            <span>New Appointment</span>
          </button>

          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2 rounded-md transition-colors"
          >
            <Edit size={18} />
            <span>Update Details</span>
          </button>
        </div>

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-teal-600 dark:text-teal-400 font-semibold">
              <User size={20} />
              <h2 className="text-lg">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Age:</span>
                <span className="font-medium text-right dark:text-gray-200">{patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Sex:</span>
                <span className="font-medium text-right dark:text-gray-200">{patient.sex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <span className="font-medium text-right dark:text-gray-200">
                  {new Date(patient.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-teal-600 dark:text-teal-400 font-semibold">
              <Phone size={20} />
              <h2 className="text-lg">Contact Details</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                <span className="font-medium text-right dark:text-gray-200">{patient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Home:</span>
                <span className="font-medium text-right dark:text-gray-200">{patient.homeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Location:</span>
                <span className="font-medium text-right dark:text-gray-200">{patient.place}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records Button */}
        <button
          onClick={() => setShowMedicalRecords(!showMedicalRecords)}
          className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <FileText size={18} />
          <span className="font-medium">{showMedicalRecords ? "Hide Medical Records" : "Show Medical Records"}</span>
          {showMedicalRecords ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* Medical Records Table */}
        {showMedicalRecords && (
          <div className="mt-6 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Medical Records</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Visit Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Renewal Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  {medicalHistory.length > 0 ? (
                    medicalHistory.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {record.doctor?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {record.department || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          ₹{record.consultationFees?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {new Date(record.renewalDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.prescriptionAdded === "added"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                : record.prescriptionAdded === "pending"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                            }`}
                          >
                            {record.prescriptionAdded === "added"
                              ? "Completed"
                              : record.prescriptionAdded === "pending"
                                ? "Pending"
                                : "Not Added"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No previous medical records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Update Patient Modal */}
      {isUpdateModalOpen && patient && (
        <UpdatePatientModal
          patient={patient}
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* New Appointment Modal - Always render but control visibility with isOpen prop */}
      <NewAppointmentModal
        patient={patient}
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSuccess={handleAppointmentSuccess}
      />
    </div>
  )
}

export default PatientDetails
