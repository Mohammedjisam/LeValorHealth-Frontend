"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, User, Phone, Home } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Calendar as CalendarComponent } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../lib/utils";
import receptionistAxiosInstance from "../../services/receptionistAxiosInstance";

// Define interfaces
interface Doctor {
  _id: string;
  name: string;
  department: string;
  consultationFees: number;
}

interface Patient {
  _id: string;
  name: string;
  age: number;
  sex: string;
  homeName: string;
  place: string;
  phone: string;
  opNumber: string;
  [key: string]: any;
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
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess?: (data: any) => void;
}

export default function NewAppointmentModal({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: NewAppointmentModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: new Date(),
      renewalDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      department: "",
      consultationFees: 0,
    },
  });

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await receptionistAxiosInstance.get("/doctors/active");
        if (response.data.status && response.data.data) {
          setDoctors(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        toast.error("Failed to load doctors");
      }
    };

    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  // Handle doctor selection to auto-fill department and fees
  const handleDoctorChange = (doctorId: string) => {
    const selectedDoctor = doctors.find((doctor) => doctor._id === doctorId);

    if (selectedDoctor) {
      form.setValue("department", selectedDoctor.department);
      form.setValue("consultationFees", selectedDoctor.consultationFees);
    }
  };

  const printPrescriptionPDF = async (patientId: string) => {
    try {
      const response = await receptionistAxiosInstance.get(
        `/patients/${patientId}/print-prescription`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(blob);

      // Create a full-screen iframe that loads and prints the PDF silently
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "100vw";
      iframe.style.height = "100vh";
      iframe.style.border = "none";
      iframe.src = pdfUrl;

      document.body.appendChild(iframe);

      // Wait for it to load, then trigger print
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Optionally remove iframe after print
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    } catch (error) {
      console.error("Error printing prescription:", error);
      toast.error("Failed to open prescription for printing.");
    }
  };

  // Handle form submission
  const onSubmit = async (values: AppointmentFormValues) => {
    if (!patient?._id) {
      toast.error("Patient information is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await receptionistAxiosInstance.post(
        "patients/existing/add",
        {
          existingPatientId: patient._id,
          doctorId: values.doctorId,
          date: values.date,
          renewalDate: values.renewalDate,
        }
      );

      if (response.data.status) {
        toast.success("Appointment created successfully");

        // Print the prescription
        await printPrescriptionPDF(response.data.data._id);

        if (onSuccess) {
          onSuccess(response.data.data);
        }
        onClose();
      }
    } catch (error) {
      console.error("Failed to create appointment:", error);
      toast.error("Failed to create appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl dark:text-gray-100">
            New Appointment
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Create a new appointment for the existing patient.
          </DialogDescription>
        </DialogHeader>

        {patient ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Patient Information Section - Read Only */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-4">
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center">
                      <User size={14} className="mr-1.5 text-teal-500" />
                      Name
                    </p>
                    <p className="text-sm">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center">
                      <User size={14} className="mr-1.5 text-teal-500" />
                      Age/Sex
                    </p>
                    <p className="text-sm">
                      {patient.age} /{" "}
                      {patient.sex.charAt(0).toUpperCase() +
                        patient.sex.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center">
                      <Phone size={14} className="mr-1.5 text-teal-500" />
                      Phone
                    </p>
                    <p className="text-sm">{patient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center">
                      <Home size={14} className="mr-1.5 text-teal-500" />
                      Address
                    </p>
                    <p className="text-sm">
                      {patient.homeName}, {patient.place}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details Section */}
              <div className="space-y-4">
                <h3 className="font-medium">Appointment Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Doctor Selection */}
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="dark:text-gray-300">
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
                            <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {doctors.map((doctor) => (
                              <SelectItem
                                key={doctor._id}
                                value={doctor._id}
                                className="dark:text-gray-100 dark:focus:bg-gray-700"
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

                  {/* Department - Auto-filled */}
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="dark:text-gray-300">
                          Department
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="w-full bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-100"
                          />
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
                      <FormItem className="w-full">
                        <FormLabel className="dark:text-gray-300">
                          Consultation Fees
                        </FormLabel>
                        <FormControl>
                          <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                              ₹
                            </span>
                            <Input
                              type="number"
                              className="w-full pl-7 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-100"
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

                {/* Date Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="dark:text-gray-300">
                          Appointment Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100",
                                  !field.value &&
                                    "text-muted-foreground dark:text-gray-400"
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
                            className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700"
                            align="start"
                          >
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="dark:bg-gray-800 dark:text-gray-100"
                            />
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
                        <FormLabel className="dark:text-gray-300">
                          Renewal Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100",
                                  !field.value &&
                                    "text-muted-foreground dark:text-gray-400"
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
                            className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700"
                            align="start"
                          >
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="dark:bg-gray-800 dark:text-gray-100"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onClose}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                >
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-500" />
            <p>Loading patient information...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
