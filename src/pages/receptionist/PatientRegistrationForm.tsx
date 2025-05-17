"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Printer, UserPlus } from "lucide-react"
import { useReactToPrint } from "react-to-print"
import { useRef } from "react"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { cn } from "../../lib/utils"
import { Textarea } from "../../components/ui/textarea"
import PrescriptionPrint from "../../components/receptionist/PrescriptionPrint"
import receptionistAxiosInstance from "../../services/receptionistAxiosInstance"


// Define the doctor interface
interface Doctor {
  _id: string
  name: string
  department: string
  consultationFees: number
}

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  sex: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  age: z.coerce.number().min(0, { message: "Age must be a positive number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  date: z.date({
    required_error: "Date is required",
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

type FormValues = z.infer<typeof formSchema>

export default function PatientRegistrationForm() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [registeredPatient, setRegisteredPatient] = useState<any>(null)
  const printRef = useRef<HTMLDivElement>(null)

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      age: undefined,
      date: new Date(),
      renewalDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      department: "",
      consultationFees: 0,
    },
  })

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Prescription_${registeredPatient?.name || "Patient"}`,
  })

  // Fetch active doctors on component mount
useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const response = await receptionistAxiosInstance.get("/doctors/active");
      if (response.data.status && response.data.data) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  fetchDoctors();
}, []);

  // Handle doctor selection to auto-fill department and fees
  const handleDoctorChange = (doctorId: string) => {
    const selectedDoctor = doctors.find((doctor) => doctor._id === doctorId)

    if (selectedDoctor) {
      form.setValue("department", selectedDoctor.department)
      form.setValue("consultationFees", selectedDoctor.consultationFees)
    }
  }

  // Handle form submission
 const onSubmit = async (values: FormValues) => {
  setLoading(true);

  try {
    const response = await receptionistAxiosInstance.post("/patients/add", values);
    if (response.data.status && response.data.data) {
      setRegisteredPatient(response.data.data);
      setTimeout(() => {
        handlePrint();
      }, 100);
    }
  } catch (error) {
    console.error("Failed to register patient:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Patient Registration</h1>
            <p className="text-gray-600">Register new patients and manage patient records.</p>
          </div>
          <div className="w-48 mt-6">
            <img src="/MALABAR_ACADEMIC_CITY_HOSPITAL_LOGO_page-0001__1_-removebg-preview.png" alt="Malabar Academic City Hospital" className="w-full h-auto" />
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <Button className="bg-blue-500 hover:bg-blue-600">
            <UserPlus className="mr-2 h-4 w-4" /> New Patient
          </Button>
          <div className="relative">
            <Input type="search" placeholder="Search Patient" className="w-64 pl-10" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-3 top-3 text-gray-400"
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

        <Card>
          <CardHeader>
            <CardTitle>New Patient Registration</CardTitle>
            <CardDescription>Enter patient details to register and create a new OP record</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Patient Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Sex */}
                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Age */}
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Age" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
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

                  {/* Renewal Date */}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Doctor */}
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
                              <SelectValue placeholder="Select doctor" />
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

                  {/* Department */}
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Department" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Consultation Fees */}
                  <FormField
                    control={form.control}
                    name="consultationFees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fees</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                            <Input type="number" placeholder="Amount" className="pl-7" {...field} readOnly />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Printer className="mr-2 h-4 w-4" />
                        Register and Print
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Hidden print component */}
      <div className="hidden">
        <div ref={printRef}>{registeredPatient && <PrescriptionPrint patient={registeredPatient} />}</div>
      </div>
    </>
  )
}
