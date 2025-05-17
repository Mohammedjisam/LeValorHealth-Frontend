import { format } from "date-fns"

interface Doctor {
  _id: string
  name: string
  department: string
}

interface Patient {
  _id: string
  name: string
  sex: "male" | "female" | "other"
  age: number
  address: string
  phone: string
  date: string
  renewalDate: string
  doctor: Doctor | string
  department: string
  consultationFees: number
  opNumber: string
  createdAt: string
}

interface PrescriptionPrintProps {
  patient: Patient
}

export default function PrescriptionPrint({ patient }: PrescriptionPrintProps) {
  // Format dates for display
  const visitDate = new Date(patient.date)
  const renewalDate = new Date(patient.renewalDate)

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Malabar Academic City Hospital</h1>
          <p className="text-gray-600">Care Beyond Cure</p>
        </div>
        <div className="w-32">
          <img src="/malabar-hospital-logo.png" alt="Malabar Academic City Hospital" className="w-full h-auto" />
        </div>
      </div>

      <div className="border-t border-b border-gray-300 py-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">OP Number</p>
            <p className="font-medium">{patient.opNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium">{format(visitDate, "dd/MM/yyyy")}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
        <div className="grid grid-cols-2 gap-y-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{patient.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Age/Sex</p>
            <p className="font-medium">
              {patient.age} / {patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium">{patient.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{patient.phone}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Consultation Details</h2>
        <div className="grid grid-cols-2 gap-y-4">
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="font-medium">{patient.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Doctor</p>
            <p className="font-medium">
              {typeof patient.doctor === "object" ? patient.doctor.name : "Assigned Doctor"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Consultation Fee</p>
            <p className="font-medium">₹{patient.consultationFees}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Next Visit</p>
            <p className="font-medium">{format(renewalDate, "dd/MM/yyyy")}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Prescription</h2>
        <div className="min-h-[200px] border border-gray-200 rounded-md p-4">
          {/* Prescription content would go here */}
          <p className="text-gray-400 italic">Prescription details will be added by the doctor.</p>
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
        <p>This is a computer generated prescription and does not require physical signature.</p>
      </div>
    </div>
  )
}
