"use client"

import { useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import { Fragment } from "react"
import adminAxiosInstance from "../../../services/adminAxiosInstance"

interface Doctor {
  _id: string
  name: string
}

interface Patient {
  _id: string
  name: string
  sex: "male" | "female" | "other"
  age: number
  homeName: string
  place: string
  phone: string
  regNumber: string
  opNumber: string
  date: string
  renewalDate: string
  doctor: Doctor
  department: string
  consultationFees: number
  prescriptionAdded: "added" | "pending"
  prescriptionPhotoUrl?: string
}

interface MedicalRecord {
  _id: string
  doctor: Doctor
  department: string
  consultationFees: number
  date: string
  renewalDate: string
  prescriptionAdded: "added" | "pending"
}

interface ViewPatientDetailsModalProps {
  isOpen: boolean
  patient: Patient
  onClose: () => void
}

const ViewPatientDetailsModal = ({ isOpen, patient, onClose }: ViewPatientDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState("details")
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && patient) {
      fetchMedicalRecords()
    }
  }, [isOpen, patient])

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true)
      const response = await adminAxiosInstance.get(`/patients/medical-records/${patient.regNumber}`)
      if (response.data.status) {
        setMedicalRecords(response.data.data)
      } else {
        setError(response.data.message || "Failed to fetch medical records")
      }
    } catch (err) {
      setError("An error occurred while fetching medical records")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrescription = async (patientId: string) => {
    try {
      const response = await adminAxiosInstance.get(`/patients/${patientId}/prescription`)
      if (response.data.status) {
        setPrescriptionUrl(response.data.url)
        setIsPrescriptionModalOpen(true)
      } else {
        console.error(response.data.message)
      }
    } catch (err) {
      console.error("Error fetching prescription:", err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Patient Details
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                      <button
                        className={`py-2 px-4 focus:outline-none ${
                          activeTab === "details"
                            ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                        onClick={() => setActiveTab("details")}
                      >
                        Personal Details
                      </button>
                      <button
                        className={`py-2 px-4 focus:outline-none ${
                          activeTab === "medical"
                            ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                        onClick={() => setActiveTab("medical")}
                      >
                        Medical Records
                      </button>
                    </div>
                  </div>

                  {activeTab === "details" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-md font-medium mb-3 text-gray-900 dark:text-white">Personal Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                            <p className="text-gray-900 dark:text-white">{patient.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</p>
                            <p className="text-gray-900 dark:text-white">{patient.age}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                            <p className="text-gray-900 dark:text-white capitalize">{patient.sex}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="text-gray-900 dark:text-white">{patient.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Home Name</p>
                            <p className="text-gray-900 dark:text-white">{patient.homeName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Place</p>
                            <p className="text-gray-900 dark:text-white">{patient.place}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-md font-medium mb-3 text-gray-900 dark:text-white">Registration Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reg Number</p>
                            <p className="text-gray-900 dark:text-white">{patient.regNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">OP Number</p>
                            <p className="text-gray-900 dark:text-white">{patient.opNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</p>
                            <p className="text-gray-900 dark:text-white">{formatDate(patient.date)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Renewal Date</p>
                            <p className="text-gray-900 dark:text-white">{formatDate(patient.renewalDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Doctor</p>
                            <p className="text-gray-900 dark:text-white">Dr. {patient.doctor?.name || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
                            <p className="text-gray-900 dark:text-white">{patient.department}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Consultation Fees</p>
                            <p className="text-gray-900 dark:text-white">₹{patient.consultationFees}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Prescription Status</p>
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                patient.prescriptionAdded === "added"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {patient.prescriptionAdded === "added" ? "Added" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "medical" && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-md font-medium mb-3 text-gray-900 dark:text-white">Medical History</h4>

                      {loading ? (
                        <div className="flex justify-center items-center h-40">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : error ? (
                        <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-100 px-4 py-3 rounded-md">
                          {error}
                        </div>
                      ) : medicalRecords.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No medical records found for this patient
                        </div>
                      ) : (
                        <div className="overflow-auto max-h-96">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-100 dark:bg-gray-600">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Doctor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Fees
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Renewal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Prescription
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {medicalRecords.map((record, index) => (
                                <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {formatDate(record.date)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    Dr. {record.doctor?.name || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {record.department}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    ₹{record.consultationFees}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {formatDate(record.renewalDate)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {record.prescriptionAdded === "added" ? (
                                      <button
                                        onClick={() => fetchPrescription(patient._id)}
                                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                      >
                                        <DocumentTextIcon className="h-5 w-5 mr-1" />
                                        View
                                      </button>
                                    ) : (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                        Pending
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Prescription Modal */}
      <Transition appear show={isPrescriptionModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={() => setIsPrescriptionModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Prescription
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => setIsPrescriptionModalOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex justify-center items-center">
                    {prescriptionUrl ? (
                      <img
                        src={prescriptionUrl || "/placeholder.svg"}
                        alt="Prescription"
                        className="max-w-full h-auto object-contain rounded-md"
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Prescription image not available
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default ViewPatientDetailsModal
