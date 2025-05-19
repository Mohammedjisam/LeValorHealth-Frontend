"use client"

import { useEffect, useState } from "react"
import { Search, Clock, Filter } from "lucide-react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { format } from "date-fns"
import scannerAxiosInstance from "../../services/scannerAxiosInstance"

interface Patient {
  _id: string
  opNumber: string
  name: string
  phone: string
  place: string
  doctor: { name: string } | string
  date: string
  prescriptionAdded: "added" | "pending"
}

const PrescriptionScanner = () => {
  const [pendingPatients, setPendingPatients] = useState<Patient[]>([])
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [filteredPendingPatients, setFilteredPendingPatients] = useState<Patient[]>([])
  const [filteredAllPatients, setFilteredAllPatients] = useState<Patient[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")

useEffect(() => {
  const fetchPendingPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await scannerAxiosInstance.get("/pending-patients");

      if (response.data.status) {
        setPendingPatients(response.data.data);
        setFilteredPendingPatients(response.data.data);
        setPendingCount(response.data.data.length);
      }
    } catch (error) {
      console.error("Error fetching pending prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchPendingPrescriptions();
}, []);

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllPatients()
    }
  }, [activeTab])

const fetchAllPatients = async () => {
  try {
    setLoading(true);
    const response = await scannerAxiosInstance.get("/all-patients");

    if (response.data.status) {
      setAllPatients(response.data.data);
      setFilteredAllPatients(response.data.data);
    }
  } catch (error) {
    console.error("Error fetching all patients:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPendingPatients(pendingPatients)
      setFilteredAllPatients(allPatients)
      return
    }

    const query = searchQuery.toLowerCase()

    // Filter pending patients
    const filteredPending = pendingPatients.filter(
      (patient) =>
        patient.opNumber.toLowerCase().includes(query) ||
        patient.name.toLowerCase().includes(query) ||
        patient.phone.toLowerCase().includes(query) ||
        (typeof patient.doctor === "object" && patient.doctor.name.toLowerCase().includes(query)),
    )
    setFilteredPendingPatients(filteredPending)

    // Filter all patients
    const filteredAll = allPatients.filter(
      (patient) =>
        patient.opNumber.toLowerCase().includes(query) ||
        patient.name.toLowerCase().includes(query) ||
        patient.phone.toLowerCase().includes(query) ||
        (typeof patient.doctor === "object" && patient.doctor.name.toLowerCase().includes(query)),
    )
    setFilteredAllPatients(filteredAll)
  }, [searchQuery, pendingPatients, allPatients])

  const handleSelect = (patientId: string) => {
    console.log("Selected patient:", patientId)
    // Implement your selection logic here
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchQuery("")
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Prescription Scanner</h1>
          <p className="text-gray-500 text-sm">Upload and manage patient prescriptions.</p>
        </div>
        <div className="flex items-center">
          <img src="/MALABAR_ACADEMIC_CITY_HOSPITAL_LOGO_page-0001__1_-removebg-preview.png" alt="Malabar Academic City Hospital" className="h-18 mt-5" />
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full" onValueChange={handleTabChange}>
        <div className="flex justify-between items-center mb-4 ">
          <TabsList className="bg-gray-100 w-2000 h-10">
            <TabsTrigger value="pending" className="data-[state=active]:bg-white">
              <Clock className="h-4 w-4 mr-2" />
              Pending Prescriptions
              {pendingCount > 0 && (
                <Badge className="ml-2 bg-amber-500 hover:bg-amber-500 text-white">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-white">
              <Filter className="h-4 w-4 mr-2" />
              All Prescriptions
            </TabsTrigger>
          </TabsList>
        
        </div>

        <TabsContent value="pending" className="mt-0">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <div className="relative w-full">
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ display: loading ? "flex" : "none" }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>

                <div className={loading ? "opacity-50" : ""}>
                  <div className="relative overflow-x-auto rounded-md">
                    <div className="p-4 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Filter pending prescriptions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-gray-50 border-gray-200"
                        />
                      </div>
                    </div>

                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">OP Number</th>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Phone</th>
                          <th className="px-6 py-3">Doctor</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPendingPatients.length === 0 && !loading ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                              No pending prescriptions found
                            </td>
                          </tr>
                        ) : (
                          filteredPendingPatients.map((patient) => (
                            <tr key={patient._id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900">{patient.opNumber}</td>
                              <td className="px-6 py-4">{patient.name}</td>
                              <td className="px-6 py-4">{patient.phone}</td>
                              <td className="px-6 py-4">
                                {typeof patient.doctor === "object" ? patient.doctor.name : "—"}
                              </td>
                              <td className="px-6 py-4">{formatDate(patient.date)}</td>
                              <td className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50"
                                >
                                  Pending
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Button
                                  onClick={() => handleSelect(patient._id)}
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm px-4 py-1.5"
                                >
                                  Select
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <div className="relative w-full">
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ display: loading ? "flex" : "none" }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>

                <div className={loading ? "opacity-50" : ""}>
                  <div className="relative overflow-x-auto rounded-md">
                    <div className="p-4 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Filter all prescriptions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-gray-50 border-gray-200"
                        />
                      </div>
                    </div>

                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">OP Number</th>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Phone</th>
                          <th className="px-6 py-3">Doctor</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAllPatients.length === 0 && !loading ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                              No patients found
                            </td>
                          </tr>
                        ) : (
                          filteredAllPatients.map((patient) => (
                            <tr key={patient._id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900">{patient.opNumber}</td>
                              <td className="px-6 py-4">{patient.name}</td>
                              <td className="px-6 py-4">{patient.phone}</td>
                              <td className="px-6 py-4">
                                {typeof patient.doctor === "object" ? patient.doctor.name : "—"}
                              </td>
                              <td className="px-6 py-4">{formatDate(patient.date)}</td>
                              <td className="px-6 py-4">
                                {patient.prescriptionAdded === "pending" ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50"
                                  >
                                    Pending
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                                  >
                                    Added
                                  </Badge>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Button
                                  onClick={() => handleSelect(patient._id)}
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm px-4 py-1.5"
                                >
                                  Select
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PrescriptionScanner
