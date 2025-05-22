"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Search, Clock, Filter, Camera, Upload, X, Sun, Moon, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../../components/ui/dialog"
import { format } from "date-fns"
import { useTheme } from "../../components/theme-provider"
import scannerAxiosInstance from "../../services/scannerAxiosInstance"
import receptionistAxiosInstance from "../../services/receptionistAxiosInstance"

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

interface PatientDetails extends Patient {
  age?: number
  sex?: string
  homeName?: string
  department?: string
  consultationFees?: number
  renewalDate?: string
}

interface Pagination {
  total: number
  pages: number
  page: number
  limit: number
}

const PrescriptionScanner = () => {
  const { theme, setTheme } = useTheme()
  const [pendingPatients, setPendingPatients] = useState<Patient[]>([])
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [filteredPendingPatients, setFilteredPendingPatients] = useState<Patient[]>([])
  const [filteredAllPatients, setFilteredAllPatients] = useState<Patient[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)

  // Pagination states
  const [pendingPagination, setPendingPagination] = useState<Pagination>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 6,
  })
  const [allPagination, setAllPagination] = useState<Pagination>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 6,
  })

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [prescriptionImage, setPrescriptionImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  useEffect(() => {
    fetchPendingPrescriptions()
  }, [pendingPagination.page])

  const fetchPendingPrescriptions = async () => {
    try {
      setLoading(true)
      const response = await scannerAxiosInstance.get("/pending-patients", {
        params: {
          page: pendingPagination.page,
          limit: pendingPagination.limit,
        },
      })

      if (response.data.status) {
        setPendingPatients(response.data.data)
        setFilteredPendingPatients(response.data.data)
        setPendingCount(response.data.pagination.total)
        setPendingPagination(response.data.pagination)
      }
    } catch (error) {
      console.error("Error fetching pending prescriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllPatients()
    }
  }, [activeTab, allPagination.page])

  const fetchAllPatients = async () => {
    try {
      setLoading(true)
      const response = await scannerAxiosInstance.get("/all-patients", {
        params: {
          page: allPagination.page,
          limit: allPagination.limit,
        },
      })

      if (response.data.status) {
        setAllPatients(response.data.data)
        setFilteredAllPatients(response.data.data)
        setAllPagination(response.data.pagination)
      }
    } catch (error) {
      console.error("Error fetching all patients:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 20)

    return () => clearTimeout(timeout) // cleanup
  }, [searchQuery])

  useEffect(() => {
    const fetchFilteredPatients = async () => {
      if (!debouncedQuery.trim()) {
        if (activeTab === "pending") {
          fetchPendingPrescriptions()
        } else {
          fetchAllPatients()
        }
        return
      }

      try {
        setLoading(true)
        const response = await scannerAxiosInstance.get(`/search`, {
          params: { query: debouncedQuery },
        })

        if (response.data.status) {
          const filtered = response.data.data

          if (activeTab === "pending") {
            const pendingOnly = filtered.filter((p: Patient) => p.prescriptionAdded === "pending")
            setFilteredPendingPatients(pendingOnly)
          } else {
            setFilteredAllPatients(filtered)
          }
        }
      } catch (error) {
        console.error("Error filtering patients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilteredPatients()
  }, [debouncedQuery, activeTab])

  const handleSelect = async (patientId: string) => {
    try {
      const response = await receptionistAxiosInstance.get(`/patients/${patientId}`)
      if (response.data.status) {
        setSelectedPatient(response.data.data)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error("Error fetching patient details:", error)
    }
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
    // Reset pagination when switching tabs
    if (value === "pending") {
      setPendingPagination({ ...pendingPagination, page: 1 })
    } else {
      setAllPagination({ ...allPagination, page: 1 })
    }
  }

  const handlePageChange = (newPage: number) => {
    if (activeTab === "pending") {
      if (newPage > 0 && newPage <= pendingPagination.pages) {
        setPendingPagination({ ...pendingPagination, page: newPage })
      }
    } else {
      if (newPage > 0 && newPage <= allPagination.pages) {
        setAllPagination({ ...allPagination, page: newPage })
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPrescriptionImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setIsCameraOpen(false)
    }
  }

  const handleOpenCamera = () => {
    setIsCameraOpen(true)
    // Default to environment (back) camera
    setFacingMode("environment")
  }

  useEffect(() => {
    const startCamera = async () => {
      if (!isCameraOpen || !videoRef.current) return

      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
        })
        streamRef.current = stream

        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
      }
    }

    startCamera()
  }, [isCameraOpen, facingMode])

  const handleSwitchCamera = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user")
  }

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current video frame on the canvas
      const context = canvas.getContext("2d")
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "prescription.jpg", { type: "image/jpeg" })
              setPrescriptionImage(file)
              setPreviewUrl(URL.createObjectURL(blob))

              // Stop the camera stream
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
                streamRef.current = null
              }

              setIsCameraOpen(false)
            }
          },
          "image/jpeg",
          0.95,
        )
      }
    }
  }

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const handleAddPrescription = async () => {
    if (!prescriptionImage || !selectedPatient) return

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("file", prescriptionImage)
      formData.append("patientId", selectedPatient._id)

      const response = await scannerAxiosInstance.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.status) {
        setUploadSuccess(true)

        // Refresh data after successful upload
        if (activeTab === "pending") {
          fetchPendingPrescriptions()
        } else {
          fetchAllPatients()
        }

        // Close modal and reset state
        setTimeout(() => {
          setIsModalOpen(false)
          setPrescriptionImage(null)
          setPreviewUrl(null)
          setUploadSuccess(false)
        }, 500)
      }
    } catch (error) {
      console.error("Error uploading prescription:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleModalClose = () => {
    // Clean up resources when modal closes
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsModalOpen(false)
    setSelectedPatient(null)
    setPrescriptionImage(null)
    setPreviewUrl(null)
    setIsCameraOpen(false)
    setUploadSuccess(false)
  }

  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const pagination = activeTab === "pending" ? pendingPagination : allPagination
    const currentPage = pagination.page
    const totalPages = pagination.pages

    const pages = []

    // Always show first page
    pages.push(1)

    // Calculate range around current page
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push("...")
    }

    // Add pages in range
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push("...")
    }

    // Add last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Prescription Scanner</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Upload and manage patient prescriptions.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle Button - positioned near the logo */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-background/90 backdrop-blur-sm hover:bg-background/70 h-8 w-8 sm:h-9 sm:w-9"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-primary" />}
          </Button>

          <img
            src="/MALABAR_ACADEMIC_CITY_HOSPITAL_LOGO_page-0001__1_-removebg-preview.png"
            alt="Malabar Academic City Hospital"
            className="h-12 sm:h-16"
          />
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full" onValueChange={handleTabChange}>
        <div className="flex justify-between items-center mb-3">
          <TabsList className="bg-muted w-full sm:w-auto h-10 sm:h-14">
            <TabsTrigger value="pending" className="data-[state=active]:bg-background text-xs sm:text-sm">
              <Clock className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden xs:inline">Pending</span> Prescriptions
              {pendingCount > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-amber-500 hover:bg-amber-500 text-white text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-background text-xs sm:text-sm">
              <Filter className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
              All Prescriptions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="mt-0">
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <div className="relative w-full">
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ display: loading ? "flex" : "none" }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>

                <div className={loading ? "opacity-50" : ""}>
                  <div className="relative overflow-x-auto rounded-md">
                    <div className="p-3 border-b border-border/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <Input
                          placeholder="Filter pending prescriptions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 sm:pl-10 bg-muted/50 border-border text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50">
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
                              <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                No pending prescriptions found
                              </td>
                            </tr>
                          ) : (
                            filteredPendingPatients.map((patient) => (
                              <tr key={patient._id} className="bg-background border-b hover:bg-muted/20">
                                <td className="px-6 py-4 font-medium">{patient.opNumber}</td>
                                <td className="px-6 py-4">{patient.name}</td>
                                <td className="px-6 py-4">{patient.phone}</td>
                                <td className="px-6 py-4">
                                  {typeof patient.doctor === "object" ? patient.doctor.name : "—"}
                                </td>
                                <td className="px-6 py-4">{formatDate(patient.date)}</td>
                                <td className="px-6 py-4">
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
                                  >
                                    Pending
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <Button
                                    onClick={() => handleSelect(patient._id)}
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-medium rounded-md text-sm px-4 py-1.5"
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

                    {/* Mobile Table - Simplified */}
                    <div className="block md:hidden">
                      <table className="w-full text-xs sm:text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 sm:px-4 sm:py-3">OP Number</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3">Name</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPendingPatients.length === 0 && !loading ? (
                            <tr>
                              <td colSpan={3} className="px-3 py-8 sm:px-4 sm:py-12 text-center text-muted-foreground">
                                No pending prescriptions found
                              </td>
                            </tr>
                          ) : (
                            filteredPendingPatients.map((patient) => (
                              <tr key={patient._id} className="bg-background border-b hover:bg-muted/20">
                                <td className="px-3 py-2 sm:px-4 sm:py-3 font-medium">{patient.opNumber}</td>
                                <td className="px-3 py-2 sm:px-4 sm:py-3">{patient.name}</td>
                                <td className="px-3 py-2 sm:px-4 sm:py-3 text-right">
                                  <Button
                                    onClick={() => handleSelect(patient._id)}
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-medium rounded-md text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
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

                    {/* Pagination */}
                    {pendingPagination.pages > 1 && (
                      <div className="flex items-center justify-center space-x-2 p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pendingPagination.page - 1)}
                          disabled={pendingPagination.page === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous page</span>
                        </Button>

                        {generatePaginationNumbers().map((page, index) =>
                          page === "..." ? (
                            <span key={`ellipsis-${index}`} className="text-muted-foreground">
                              ...
                            </span>
                          ) : (
                            <Button
                              key={`page-${page}`}
                              variant={pendingPagination.page === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => typeof page === "number" && handlePageChange(page)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          ),
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pendingPagination.page + 1)}
                          disabled={pendingPagination.page === pendingPagination.pages}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next page</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <div className="relative w-full">
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ display: loading ? "flex" : "none" }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>

                <div className={loading ? "opacity-50" : ""}>
                  <div className="relative overflow-x-auto rounded-md">
                    <div className="p-3 border-b border-border/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <Input
                          placeholder="Filter all prescriptions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 sm:pl-10 bg-muted/50 border-border text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50">
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
                              <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                No patients found
                              </td>
                            </tr>
                          ) : (
                            filteredAllPatients.map((patient) => (
                              <tr key={patient._id} className="bg-background border-b hover:bg-muted/20">
                                <td className="px-6 py-4 font-medium">{patient.opNumber}</td>
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
                                      className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
                                    >
                                      Pending
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                                    >
                                      Added
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <Button
                                    onClick={() => handleSelect(patient._id)}
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md text-sm px-4 py-1.5"
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

                    {/* Mobile Table - Simplified */}
                    <div className="block md:hidden">
                      <table className="w-full text-xs sm:text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 sm:px-4 sm:py-3">OP Number</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3">Name</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAllPatients.length === 0 && !loading ? (
                            <tr>
                              <td colSpan={3} className="px-3 py-8 sm:px-4 sm:py-12 text-center text-muted-foreground">
                                No patients found
                              </td>
                            </tr>
                          ) : (
                            filteredAllPatients.map((patient) => (
                              <tr key={patient._id} className="bg-background border-b hover:bg-muted/20">
                                <td className="px-3 py-2 sm:px-4 sm:py-3 font-medium">{patient.opNumber}</td>
                                <td className="px-3 py-2 sm:px-4 sm:py-3">{patient.name}</td>
                                <td className="px-3 py-2 sm:px-4 sm:py-3 text-right">
                                  <Button
                                    onClick={() => handleSelect(patient._id)}
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
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

                    {/* Pagination */}
                    {allPagination.pages > 1 && (
                      <div className="flex items-center justify-center space-x-2 p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(allPagination.page - 1)}
                          disabled={allPagination.page === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous page</span>
                        </Button>

                        {generatePaginationNumbers().map((page, index) =>
                          page === "..." ? (
                            <span key={`ellipsis-${index}`} className="text-muted-foreground">
                              ...
                            </span>
                          ) : (
                            <Button
                              key={`page-${page}`}
                              variant={allPagination.page === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => typeof page === "number" && handlePageChange(page)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          ),
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(allPagination.page + 1)}
                          disabled={allPagination.page === allPagination.pages}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next page</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Patient Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Patient Prescription Upload</DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Details */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Patient Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">OP Number</p>
                    <p className="font-medium">{selectedPatient.opNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedPatient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedPatient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-medium">
                      {typeof selectedPatient.doctor === "object"
                        ? selectedPatient.doctor.name
                        : selectedPatient.doctor || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Camera and Upload Section */}
              {!previewUrl ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex space-x-3">
                    <Button onClick={handleOpenCamera} className="flex-1" variant="outline">
                      <Camera className="mr-2 h-4 w-4" />
                      Open Camera
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} className="flex-1" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Camera View */}
                  {isCameraOpen && (
                    <div className="relative mt-4 border rounded-lg overflow-hidden">
                      <video ref={videoRef} className="w-full h-64 object-cover bg-black" autoPlay playsInline muted />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/50 flex justify-between">
                        <Button onClick={handleCloseCamera} variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                        {/* <Button onClick={handleSwitchCamera} variant="secondary" size="sm">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Switch Camera
                        </Button> */}
                        <Button onClick={handleCapturePhoto} variant="default" size="sm">
                          <Camera className="h-4 w-4 mr-1" />
                          Capture
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Prescription Preview"
                      className="w-full max-h-64 object-contain"
                    />
                    <Button
                      onClick={() => {
                        setPreviewUrl(null)
                        setPrescriptionImage(null)
                      }}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button onClick={handleAddPrescription} className="w-full" disabled={isUploading || uploadSuccess}>
                    {isUploading ? "Uploading..." : uploadSuccess ? "Prescription Added!" : "Add Prescription"}
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PrescriptionScanner
