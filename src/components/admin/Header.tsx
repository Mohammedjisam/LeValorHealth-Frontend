import type React from "react"
import { Search } from "lucide-react"

interface HeaderProps {
  title?: string
}

const Header: React.FC<HeaderProps> = ({ title = "Admin" }) => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <a href="/" className="text-gray-600 hover:text-gray-900">
          Home
        </a>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{title}</span>
      </div>

      <div className="relative w-[300px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search patients, doctors, etc."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
    </header>
  )
}

export default Header
