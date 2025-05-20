import type React from "react";
import { useState, type FormEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import adminAxiosInstance from "../../../services/adminAxiosInstance";

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  qualification: string;
  specialization: string;
  department: string;
  gender: "male" | "female" | "other";
  age: number;
  phone: string;
  email: string;
  consultationFees: number;
}

const AddDoctorModal = ({ isOpen, onClose, onSuccess }: AddDoctorModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    qualification: "",
    specialization: "",
    department: "",
    gender: "male",
    age: 35,
    phone: "",
    email: "",
    consultationFees: 0,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required";
    if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required";
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.age || formData.age < 18) newErrors.age = "Age must be at least 18";
    if (formData.consultationFees < 0) newErrors.consultationFees = "Fees cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseInt(value) : value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await adminAxiosInstance.post("/doctors/add", formData);
      if (response.data.status) {
        onSuccess();
      } else {
        setSubmitError(response.data.message || "Failed to add doctor");
      }
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || "An error occurred while adding the doctor");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-[#1f2937] text-gray-900 dark:text-gray-100 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">Add New Doctor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Fill in the doctor's information. A unique register number will be generated automatically.
          </p>

          {submitError && (
            <div className="mb-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "name", label: "Full Name", type: "text", placeholder: "Dr. John Doe" },
                { id: "qualification", label: "Qualification", type: "text", placeholder: "MD, MBBS, etc." },
                { id: "specialization", label: "Specialization", type: "text", placeholder: "Cardiology, etc." },
                { id: "department", label: "Department", type: "text", placeholder: "Cardiac Care" },
                { id: "age", label: "Age", type: "number", placeholder: "" },
                { id: "phone", label: "Phone Number", type: "text", placeholder: "+91 XXXXXXX" },
                { id: "email", label: "Email Address", type: "email", placeholder: "doctor@example.com" },
                { id: "consultationFees", label: "Consultation Fees", type: "text", placeholder: "₹500" },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id} className="col-span-1">
                  <label htmlFor={id} className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    name={id}
                    id={id}
                    placeholder={placeholder}
                    value={(formData as any)[id]}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      (errors as any)[id] ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800`}
                  />
                  {(errors as any)[id] && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{(errors as any)[id]}</p>
                  )}
                </div>
              ))}

              <div className="col-span-1">
                <label htmlFor="gender" className="block text-sm font-medium mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Adding..." : "Add Doctor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDoctorModal;
