"use client"
import DashboardBody from "../../components/admin/dashboard/DashboardBody"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        <DashboardBody />
      </div>
    </div>
  )
}
