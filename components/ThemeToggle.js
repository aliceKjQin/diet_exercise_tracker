'use client'

import { useTheme } from "@/contexts/ThemeContext"

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme}> 
        { theme === "light" ? <i className="fa-solid fa-moon"></i> : <i className="fa-regular fa-sun"></i>} 
    </button>
  )
}
