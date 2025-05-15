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
  // In a real implementation, you would use a charting library like Chart.js, Recharts, or D3
  // This is a placeholder component that would be replaced with actual chart implementation

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-lg font-semibold mb-4">Hospital Overview</h2>
      <div className="h-[250px] w-full relative">
        {/* This would be replaced with an actual chart */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <p className="text-sm">Chart showing patients, admissions, and discharges from Jan to Jul</p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-6 text-xs">
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-blue-400 mr-1"></span>
            <span className="text-gray-600">patients</span>
          </div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
            <span className="text-gray-600">admissions</span>
          </div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-yellow-400 mr-1"></span>
            <span className="text-gray-600">discharges</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chart
