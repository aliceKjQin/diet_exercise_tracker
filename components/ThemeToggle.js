'use client'

import { useTheme } from "@/contexts/ThemeContext"

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme}> 
        { theme === "light" ? <i className="fa-solid fa-cloud text-blue-400"></i> : <i className="fa-solid fa-cloud text-purple-400"></i>} 
    </button>
  )
}
