"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Search, Eye, Loader2 } from "lucide-react"
import receptionistAxiosInstance from "../../services/receptionistAxiosInstance"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"

interface Patient {
  _id: string
  opNumber: string
  name: string
  age: number
  homeName?: string
  place: string
  phone: string
  doctor: { name: string } | string
}

const PatientSearch: React.FC = () => {
  const [query, setQuery] = useState<string>("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [debouncedQuery, setDebouncedQuery] = useState<string>("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 20)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const fetchPatients = async () => {
      if (!debouncedQuery.trim()) {
        setPatients([])
        return
      }

      try {
        setLoading(true)
        const res = await receptionistAxiosInstance.get(`/patients/search?query=${debouncedQuery}`)
        if (res.data.status) {
          setPatients(res.data.data)
        } else {
          setPatients([])
        }
      } catch (err) {
        console.error("Search error:", err)
        setPatients([])
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [debouncedQuery])

const handleViewDetails = async (patientId: string) => {
  try {
    const res = await receptionistAxiosInstance.get(`/patients/${patientId}`)
    if (res.data.status) {
      console.log("Patient details:", res.data.data)
      // You can replace this with a modal or route later
      alert(`Name: ${res.data.data.name}\nDoctor: ${res.data.data.doctor?.name || "-"}`)
    } else {
      alert("Patient not found")
    }
  } catch (err) {
    console.error("Failed to fetch patient details", err)
    alert("Error fetching patient details")
  }
}


  return (
    <Card className="w-full shadow-md border-0">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-semibold">Patient Search</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search by OP Number, Name or Phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            disabled
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
            <span className="ml-3 text-gray-500 dark:text-gray-400">Searching patients...</span>
          </div>
        ) : patients.length === 0 && debouncedQuery ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No matching patients found</p>
            <p className="text-sm mt-1">Try a different search term or check the spelling</p>
          </div>
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    OP Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Home Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Place
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {patient.opNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{patient.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{patient.age}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{patient.homeName || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{patient.place}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{patient.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {typeof patient.doctor === "object" ? patient.doctor.name : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                           <Button
  variant="outline"
  size="sm"
  onClick={() => handleViewDetails(patient._id)}
  className="text-sm font-medium text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 dark:border-blue-400 dark:text-blue-400"
>
  View Details
</Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View patient details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">Start typing to search patients</p>
            <p className="text-sm mt-1">Search by OP Number, Name or Phone</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PatientSearch
