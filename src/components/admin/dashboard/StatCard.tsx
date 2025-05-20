import type React from "react"
import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  change: string
  icon: ReactNode
  iconBgColor: string
  changeColor: string
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBgColor,
  changeColor,
}) => {
  return (
    <div className="bg-white dark:bg-[#1f2937] rounded-lg border border-gray-200 dark:border-gray-700 p-5 flex items-start">
      <div className={`${iconBgColor} p-3 rounded-lg mr-4`}>{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="flex items-baseline mt-1">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          <span className={`ml-2 text-xs font-medium ${changeColor}`}>{change}</span>
        </div>
      </div>
    </div>
  )
}

export default StatCard
