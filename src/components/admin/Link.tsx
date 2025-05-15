import type React from "react"
import type { ReactNode } from "react"

interface LinkProps {
  href: string
  children: ReactNode
  icon?: ReactNode
  isActive?: boolean
}

const Link: React.FC<LinkProps> = ({ href, children, icon, isActive = false }) => {
  return (
    <a
      href={href}
      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
        isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon && <span className={isActive ? "text-blue-600" : "text-gray-500"}>{icon}</span>}
      <span className="font-medium">{children}</span>
    </a>
  )
}

export default Link
