"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { cn } from "../../lib/utils"
import receptionistAxiosInstance from "../../services/receptionistAxiosInstance"

// Define interfaces
interface Doctor {
  _id: string
  name: string
  department: string
  consultationFees: number
}

interface Patient {
  _id: string
  name: string
  age: number
  sex: string
  homeName: string
  place: string
  phone: string
  opNumber: string
  [key: string]: any
}

// Define form schema
const appointmentFormSchema = z.object({
  date: z.date({
    required_error: "Appointment date is required",
  }),
  renewalDate: z.date({
    required_error: "Renewal date is required",
  }),
  doctorId: z.string({
    required_error: "Please select a doctor",
  }),
  department: z.string(),
  consultationFees: z.coerce.number(),
})

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>

interface NewAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  onSuccess?: (data: any) => void
}

export default function NewAppointmentModal({ isOpen, onClose, patient, onSuccess }: NewAppointmentModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: new Date(),
      renewalDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      department: "",
      consultationFees: 0,
    },
  })

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await receptionistAxiosInstance.get("/doctors/active")
        if (response.data.status && response.data.data) {
          setDoctors(response.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error)
        toast.error("Failed to load doctors")
      }
    }

    if (isOpen) {
      fetchDoctors()
    }
  }, [isOpen])

  // Handle doctor selection to auto-fill department and fees
  const handleDoctorChange = (doctorId: string) => {
    const selectedDoctor = doctors.find((doctor) => doctor._id === doctorId)

    if (selectedDoctor) {
      form.setValue("department", selectedDoctor.department)
      form.setValue("consultationFees", selectedDoctor.consultationFees)
    }
  }

  // Handle form submission
  const onSubmit = async (values: AppointmentFormValues) => {
    if (!patient?._id) {
      toast.error("Patient information is missing")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await receptionistAxiosInstance.post("patients/existing/add", {
        existingPatientId: patient._id,
        doctorId: values.doctorId,
        date: values.date,
        renewalDate: values.renewalDate,
      })

      if (response.data.status) {
        toast.success("Appointment created successfully")
        if (onSuccess) {
          onSuccess(response.data.data)
        }
        onClose()
      }
    } catch (error) {
      console.error("Failed to create appointment:", error)
      toast.error("Failed to create appointment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">New Appointment</DialogTitle>
          <DialogDescription>Create a new appointment for the existing patient.</DialogDescription>
        </DialogHeader>

        {patient ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Patient Information Section - Read Only */}
              <div className="bg-muted/40 p-4 rounded-lg space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Name</p>
                    <p className="text-sm">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Age/Sex</p>
                    <p className="text-sm">
                      {patient.age} / {patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Phone</p>
                    <p className="text-sm">{patient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Address</p>
                    <p className="text-sm">
                      {patient.homeName}, {patient.place}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details Section */}
              <div className="space-y-4">
                <h3 className="font-medium">Appointment Details</h3>

                {/* Doctor Selection */}
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleDoctorChange(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor._id} value={doctor._id}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department - Auto-filled */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-muted/40" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Consultation Fees - Auto-filled */}
                <FormField
                  control={form.control}
                  name="consultationFees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Fees</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            ₹
                          </span>
                          <Input type="number" className="pl-7 bg-muted/40" {...field} readOnly />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Appointment Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Renewal Date Selection */}
                  <FormField
                    control={form.control}
                    name="renewalDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Renewal Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Register & Print"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading patient information...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
