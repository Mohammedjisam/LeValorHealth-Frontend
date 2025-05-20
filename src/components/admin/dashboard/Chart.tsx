import type React from "react"

interface DataPoint {
  month: string
  patients: number
  admissions: number
  discharges: number
}

interface ChartProps {
  data: DataPoint[]
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-[#1f2937] rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Hospital Overview
      </h2>

      <div className="h-[250px] w-full relative">
        {/* Placeholder for chart */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
          <p className="text-sm text-center">
            Chart showing patients, admissions, and discharges from Jan to Jul
          </p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-6 text-xs pb-2">
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-blue-400 mr-1"></span>
            <span className="text-gray-600 dark:text-gray-300">patients</span>
          </div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
            <span className="text-gray-600 dark:text-gray-300">admissions</span>
          </div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-yellow-400 mr-1"></span>
            <span className="text-gray-600 dark:text-gray-300">discharges</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chart
