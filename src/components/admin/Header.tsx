import type React from "react"
import { Search, Sun, Moon } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useTheme } from "../../components/theme-provider"

interface HeaderProps {
  title?: string
}

const Header: React.FC<HeaderProps> = ({ title = "Admin" }) => {
  const { theme, setTheme } = useTheme()

  return (
    <header className="bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex justify-between items-center">
      {/* Left side: Breadcrumb */}
      <div className="flex items-center space-x-4">
        <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          Home
        </a>
        <span className="text-gray-400 dark:text-gray-500">/</span>
        <span className="text-gray-900 dark:text-white font-medium">{title}</span>
      </div>

      {/* Right side: Search + Theme Toggle */}
      <div className="flex items-center gap-4">
        {/* Search bar */}
        <div className="relative w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search patients, doctors, etc."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-[#1f2937] placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  )
}

export default Header
