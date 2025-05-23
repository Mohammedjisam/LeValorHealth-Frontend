"use client"

import { useState, useEffect } from "react"
import { EyeIcon, PlusIcon } from "@heroicons/react/24/outline"

import adminAxiosInstance from "../../services/adminAxiosInstance"
import ViewPatientDetailsModal from "../../components/admin/Patient/ViewPatientDetailsModal"

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

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

 useEffect(() => {
  fetchPatients();
}, []);

  useEffect(() => {
  const timeout = setTimeout(() => {
    fetchPatients();
  }, 20); // wait 400ms after typing stops
  return () => clearTimeout(timeout);
}, [searchQuery]);

  const fetchPatients = async () => {
  try {
    setLoading(true);
    const response = await adminAxiosInstance.get(`/patients/search?query=${encodeURIComponent(searchQuery)}`);

    if (response.data.status) {
      const fetched = response.data.data || response.data.patients;
      setPatients(fetched);
    } else {
      setError(response.data.message || "Failed to fetch patients");
    }
  } catch (err) {
    setError("An error occurred while fetching patients");
    console.error(err);
  } finally {
    setLoading(false);
  }
};



  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewModalOpen(true)
  }

const currentPatients = patients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
const totalPages = Math.ceil(patients.length / itemsPerPage);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage patient information and medical records.</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search patients by name, reg number, or place..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-100 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reg Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Home Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Place
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {currentPatients.length > 0 ? (
                  currentPatients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {patient.regNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-200 font-medium">
                              {patient.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</div>
                          
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {patient.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {patient.homeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {patient.place}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {patient.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {patient.doctor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewPatient(patient)}
                            className="flex items-center border border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 px-3 py-1 rounded-md"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredPatients.length)}</span> of{" "}
              <span className="font-medium">{filteredPatients.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"}`}
              >
                Previous
              </button>
              <div className="flex items-center justify-center px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                {currentPage} / {totalPages || 1}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages || totalPages === 0 ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"}`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {isViewModalOpen && selectedPatient && (
        <ViewPatientDetailsModal
          isOpen={isViewModalOpen}
          patient={selectedPatient}
          onClose={() => {
            setIsViewModalOpen(false)
            setSelectedPatient(null)
          }}
        />
      )}
    </div>
  )
}

export default PatientList
