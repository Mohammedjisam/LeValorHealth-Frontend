"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  FileText,
  User,
  Phone,
  Plus,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import type { Patient, MedicalRecord } from "../../types/patient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../components/ui/dialog";

import UpdatePatientModal from "../../components/receptionist/UpdatePatientModal";
import NewAppointmentModal from "../../components/receptionist/NewAppointmentModal";
import receptionistAxiosInstance from "../../services/receptionistAxiosInstance";
import { useTheme } from "../../components/theme-provider";

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [showMedicalRecords, setShowMedicalRecords] = useState(true);
  const { theme, setTheme } = useTheme();
  const [prescriptionImageUrl, setPrescriptionImageUrl] = useState<
    string | null
  >(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  

  useEffect(() => {
    if (id) {
      fetchPatientDetails(id);
    }
  }, [id]);

  const fetchPatientDetails = async (patientId: string) => {
    setIsLoading(true);
    try {
      const response = await receptionistAxiosInstance.get(
        `/patients/${patientId}`
      );
      const patientData = response.data?.data;
      setPatient(patientData);

      if (patientData?.regNumber) {
        const historyResponse = await receptionistAxiosInstance.get(
          `/patients/history/${patientData.regNumber}`
        );
        setMedicalHistory(historyResponse.data?.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch patient details");
      navigate("/patients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedPatient: Patient) => {
    setPatient(updatedPatient);
    setIsUpdateModalOpen(false);
    toast.success("Patient details updated successfully");
  };

  const handleAppointmentSuccess = (data: any) => {
    // Refresh medical history after adding a new appointment
    if (patient?.regNumber) {
      receptionistAxiosInstance
        .get(`/patients/history/${patient.regNumber}`)
        .then((response) => {
          setMedicalHistory(response.data?.data || []);
          toast.success("New appointment added successfully");
        })
        .catch((error) => {
          console.error("Failed to refresh medical history:", error);
        });
    }
  };
  const handleViewPrescription = async (patientId: string) => {
    try {
      const response = await receptionistAxiosInstance.get(
        `/patients/${patientId}/prescription-url`
      );
      if (response.data.status && response.data.url) {
        setPrescriptionImageUrl(response.data.url);
        setIsPrescriptionModalOpen(true);
      } else {
        toast.error("Prescription not found.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load prescription.");
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(-1); // Go back to previous page without reload
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        <p className="text-gray-500 dark:text-gray-400">Patient not found.</p>
        <a
          href="/patients"
          onClick={handleBackClick}
          className="text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 mt-4 inline-block"
        >
          Back to Patients
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <a
            href="/patients"
            onClick={handleBackClick}
            className="flex items-center text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Patients</span>
          </a>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">
                    <span className="text-gray-700 dark:text-gray-300">Patient Name : </span>{" "}
                    {patient.name}
                  </h1>
                  
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <b>Register Number : </b> {patient.regNumber}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <button
  onClick={() => setIsAppointmentModalOpen(true)}
  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
>
  <Plus size={18} />
  <span>New Appointment</span>
</button>

              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-md transition-colors"
              >
                <Edit size={18} />
                <span>Update Details</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-teal-500 font-semibold">
                  <User size={20} />
                  <h2 className="text-lg">Personal Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Age:
                    </span>
                    <span className="font-medium">{patient.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Sex:
                    </span>
                    <span className="font-medium">{patient.sex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      First Visited:
                    </span>
                    <span className="font-medium">
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
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-teal-500 font-semibold">
                  <Phone size={20} />
                  <h2 className="text-lg">Contact Details</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Phone:
                    </span>
                    <span className="font-medium">{patient.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Home:
                    </span>
                    <span className="font-medium">{patient.homeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Location:
                    </span>
                    <span className="font-medium">{patient.place}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Records Button */}
          <button
            onClick={() => setShowMedicalRecords(!showMedicalRecords)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
          >
            <FileText size={18} />
            <span className="font-medium">
              {showMedicalRecords
                ? "Hide Medical Records"
                : "Show Medical Records"}
            </span>
            {showMedicalRecords ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>

          {/* Medical Records Table */}
          {showMedicalRecords && (
            <div className="overflow-x-auto">
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  Medical Records
                </h3>
              </div>
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
                      Prescription
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  {medicalHistory.length > 0 ? (
                    medicalHistory.map((record, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {record.doctor?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {record.department || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ₹{record.consultationFees?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(record.renewalDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {record.prescriptionAdded === "added" ? (
                            <button
                              onClick={() => handleViewPrescription(record._id)}
                              className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                            >
                              View Prescription
                            </button>
                          ) : (
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded-full text-xs">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No previous medical records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
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

      {/* New Appointment Modal */}
      <NewAppointmentModal
        patient={patient}
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSuccess={handleAppointmentSuccess}
      />

 <Dialog open={isPrescriptionModalOpen} onOpenChange={setIsPrescriptionModalOpen}>
  <DialogContent className="max-w-3xl p-4">
    <DialogHeader>
      <DialogTitle>Prescription Image</DialogTitle>
    </DialogHeader>

    {prescriptionImageUrl ? (
      <div className="w-full max-h-[70vh] overflow-auto rounded-md border p-2 bg-white dark:bg-gray-900">
        <img
          src={prescriptionImageUrl}
          alt="Prescription"
          className="w-full h-auto object-contain rounded"
        />
      </div>
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">No image found.</p>
    )}

    <DialogFooter className="pt-4">
      <DialogClose asChild>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded">
          Close
        </button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default PatientDetails;
