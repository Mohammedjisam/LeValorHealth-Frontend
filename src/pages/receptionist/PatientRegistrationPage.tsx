"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Moon,
  Printer,
  Search,
  Sun,
  UserPlus,
  UserCircle,
  Home,
  MapPin,
  Phone,
  Stethoscope,
  Building2,
  CreditCard,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useTheme } from "../../components/theme-provider";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import PrescriptionPrint from "../../components/receptionist/PrescriptionPrint";
import receptionistAxiosInstance from "../../services/receptionistAxiosInstance";
import PatientSearch from "../receptionist/PatientSearch";

// Define the doctor interface
interface Doctor {
  _id: string;
  name: string;
  department: string;
  consultationFees: number;
}

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  sex: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  age: z.coerce.number().min(0, { message: "Age must be a positive number" }),
  homeName: z
    .string()
    .min(2, { message: "Home name must be at least 2 characters" }),
  place: z.string().min(2, { message: "Place must be at least 2 characters" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
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
});

type FormValues = z.infer<typeof formSchema>;

export default function PatientRegistrationPage() {
  const [activeTab, setActiveTab] = useState("register");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      homeName: "",
      place: "",
      phone: "",
      age: undefined,
      date: new Date(),
      renewalDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      department: "",
      consultationFees: 0,
    },
  });

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => {
      if (!printRef.current) {
        console.warn("Print ref is null");
        return null;
      }
      return printRef.current;
    },
    documentTitle: `Prescription_${registeredPatient?.name || "Patient"}`,
  });

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
    const selectedDoctor = doctors.find((doctor) => doctor._id === doctorId);

    if (selectedDoctor) {
      form.setValue("department", selectedDoctor.department);
      form.setValue("consultationFees", selectedDoctor.consultationFees);
    }
  };

  const printPDF = async (patientId: string) => {
    try {
      const response = await receptionistAxiosInstance.get(
        `/patients/${patientId}/print-prescription`,
        { responseType: "blob" }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url, "_blank");

      if (!printWindow) {
        toast.error(
          "Popup blocked. Please allow popups to print the prescription."
        );
      }
    } catch (error) {
      console.error("Failed to fetch prescription PDF:", error);
      toast.error("Failed to generate prescription.");
    }
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      const response = await receptionistAxiosInstance.post(
        "/patients/add",
        values
      );

      if (response.data.status && response.data.data) {
        const patient = response.data.data;
        setRegisteredPatient(patient);

        toast.success("Patient registered successfully");

        form.reset({
          name: "",
          sex: undefined,
          age: undefined,
          homeName: "",
          place: "",
          phone: "",
          date: new Date(),
          renewalDate: new Date(new Date().setDate(new Date().getDate() + 7)),
          doctorId: "",
          department: "",
          consultationFees: 0,
        });

        // 🔁 Print prescription
        printPDF(patient._id);
      }
    } catch (error) {
      console.error("Failed to register patient:", error);
      toast.error("Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (registeredPatient && printRef.current) {
      console.log("Ready to print:", printRef.current);
      handlePrint();
    }
  }, [registeredPatient]);

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-[1500px] mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Patient Registration
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Register new patients and manage patient records.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <div className="w-48">
                <img
                  src="/MALABAR_ACADEMIC_CITY_HOSPITAL_LOGO_page-0001__1_-removebg-preview.png"
                  alt="Malabar Academic City Hospital"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={activeTab === "register" ? "default" : "outline"}
              className={`h-14 text-base font-medium ${
                activeTab === "register"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "text-gray-800 dark:text-gray-200"
              }`}
              onClick={() => setActiveTab("register")}
            >
              <UserPlus className="mr-2 h-5 w-5" /> New Patient
            </Button>
            <Button
              variant={activeTab === "search" ? "default" : "outline"}
              className={`h-14 text-base font-medium ${
                activeTab === "search"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "text-gray-800 dark:text-gray-200"
              }`}
              onClick={() => setActiveTab("search")}
            >
              <Search className="mr-2 h-5 w-5" /> Search Patient
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="hidden">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">
                    New Patient Registration
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Enter patient details to register and create a new OP record
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Patient Name */}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <UserCircle className="h-4 w-4 text-blue-500" />
                                Patient Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Full Name"
                                  {...field}
                                  className="transition-all focus-visible:ring-blue-500"
                                />
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
                              <FormLabel className="flex items-center gap-2">
                                <svg
                                  className="h-4 w-4 text-blue-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="8" r="7" />
                                  <path d="M12 15v7" />
                                  <path d="M9 18h6" />
                                </svg>
                                Sex
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full transition-all focus-visible:ring-blue-500">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                              <FormLabel className="flex items-center gap-2">
                                <svg
                                  className="h-4 w-4 text-blue-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                                Age
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Age"
                                  {...field}
                                  className="transition-all focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Home Name */}
                        <FormField
                          control={form.control}
                          name="homeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-blue-500" />
                                Home Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Home name"
                                  {...field}
                                  className="transition-all focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Place */}
                        <FormField
                          control={form.control}
                          name="place"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-500" />
                                Place
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Place"
                                  {...field}
                                  className="transition-all focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Phone Number */}
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-500" />
                                Phone Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Contact number"
                                  {...field}
                                  className="transition-all focus-visible:ring-blue-500"
                                />
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
                              <FormLabel className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-blue-500" />
                                Registration Date
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal border transition-all focus-visible:ring-blue-500",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                  />
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
                              <FormLabel className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-blue-500" />
                                Renewal Date
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal border transition-all focus-visible:ring-blue-500",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                  />
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
                              <FormLabel className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-blue-500" />
                                Doctor
                              </FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleDoctorChange(value);
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full transition-all focus-visible:ring-blue-500">
                                    <SelectValue placeholder="Select doctor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                  {doctors.map((doctor) => (
                                    <SelectItem
                                      key={doctor._id}
                                      value={doctor._id}
                                    >
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
                              <FormLabel className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-blue-500" />
                                Department
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Department"
                                  {...field}
                                  readOnly
                                  className="bg-gray-50 dark:bg-gray-700"
                                />
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
                              <FormLabel className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-blue-500" />
                                Consultation Fees
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    ₹
                                  </span>
                                  <Input
                                    type="number"
                                    placeholder="Amount"
                                    className="pl-7 bg-gray-50 dark:bg-gray-700"
                                    {...field}
                                    readOnly
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                          disabled={loading}
                        >
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
            </TabsContent>

            <TabsContent value="search">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">
                    Search Patient
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Search for existing patient records by register number, name or
                    phone number
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PatientSearch />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Hidden print component */}
        <div className="hidden">
          <div ref={printRef}>
            {registeredPatient && (
              <div className="p-8 max-w-4xl mx-auto bg-white">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Malabar Academic City Hospital
                    </h1>
                    <p className="text-gray-600">Care Beyond Cure</p>
                  </div>
                  <div className="w-32">
                    <img
                      src="/malabar-hospital-logo.png"
                      alt="Malabar Academic City Hospital"
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                <div className="border-t border-b border-gray-300 py-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Reg Number</p>
                      <p className="font-medium">
                        {registeredPatient.regNumber}
                      </p>

                      <p className="text-sm text-gray-600">OP Number</p>
                      <p className="font-medium">
                        {registeredPatient.opNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">
                        {format(new Date(registeredPatient.date), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Patient Information
                  </h2>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{registeredPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Age/Sex</p>
                      <p className="font-medium">
                        {registeredPatient.age} /{" "}
                        {registeredPatient.sex.charAt(0).toUpperCase() +
                          registeredPatient.sex.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{registeredPatient.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{registeredPatient.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Consultation Details
                  </h2>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium">
                        {registeredPatient.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Doctor</p>
                      <p className="font-medium">
                        {typeof registeredPatient.doctor === "object"
                          ? registeredPatient.doctor.name
                          : "Assigned Doctor"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Consultation Fee</p>
                      <p className="font-medium">
                        ₹{registeredPatient.consultationFees}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Visit</p>
                      <p className="font-medium">
                        {format(
                          new Date(registeredPatient.renewalDate),
                          "dd/MM/yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Prescription</h2>
                  <div className="min-h-[200px] border border-gray-200 rounded-md p-4">
                    {/* Prescription content would go here */}
                    <p className="text-gray-400 italic">
                      Prescription details will be added by the doctor.
                    </p>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-300 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Patient Signature</p>
                    <div className="mt-8 border-t border-gray-400 w-40"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Doctor Signature</p>
                    <div className="mt-8 border-t border-gray-400 w-40"></div>
                  </div>
                </div>

                <div className="mt-12 text-center text-sm text-gray-500">
                  <p>Malabar Academic City Hospital - Care Beyond Cure</p>
                  <p>
                    This is a computer generated prescription and does not
                    require physical signature.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="hidden">
        <div ref={printRef}>
          {registeredPatient && (
            <PrescriptionPrint patient={registeredPatient} />
          )}
        </div>
      </div>
    </>
  );
}
