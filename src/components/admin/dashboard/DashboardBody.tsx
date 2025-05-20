import type React from "react"
import StatCard from './StatCard'
import Chart from './Chart'
import { Users, Bed, Calendar, DollarSign } from "lucide-react"

const DashboardBody: React.FC = () => {
  const chartData = [
    { month: "Jan", patients: 65, admissions: 25, discharges: 20 },
    { month: "Feb", patients: 58, admissions: 24, discharges: 22 },
    { month: "Mar", patients: 78, admissions: 35, discharges: 30 },
    { month: "Apr", patients: 80, admissions: 30, discharges: 35 },
    { month: "May", patients: 55, admissions: 25, discharges: 22 },
    { month: "Jun", patients: 54, admissions: 30, discharges: 25 },
    { month: "Jul", patients: 40, admissions: 20, discharges: 18 },
  ]

  return (
    <div className="p-6 bg-gray-50 dark:bg-[#0f172a] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Hospital management overview and statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Patients"
          value="1,284"
          change="+12%"
          icon={<Users size={24} className="text-blue-600" />}
          iconBgColor="bg-blue-100 dark:bg-blue-900"
          changeColor="text-green-500"
        />
        <StatCard
          title="Available Rooms"
          value="46"
          change="-3%"
          icon={<Bed size={24} className="text-green-600" />}
          iconBgColor="bg-green-100 dark:bg-green-900"
          changeColor="text-red-500"
        />
        <StatCard
          title="Appointments"
          value="125"
          change="+8%"
          icon={<Calendar size={24} className="text-yellow-600" />}
          iconBgColor="bg-yellow-100 dark:bg-yellow-900"
          changeColor="text-green-500"
        />
        <StatCard
          title="Revenue"
          value="$67,800"
          change="+15%"
          icon={<DollarSign size={24} className="text-green-600" />}
          iconBgColor="bg-green-100 dark:bg-green-900"
          changeColor="text-green-500"
        />
      </div>

      <Chart data={chartData} />
    </div>
  )
}

export default DashboardBody
