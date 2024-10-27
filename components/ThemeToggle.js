'use client'

import { useTheme } from "@/contexts/ThemeContext"

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme}> 
        { theme === "light" ? <i className="fa-solid fa-cloud" style={{color: "#74C0FC"}}></i> : <i className="fa-solid fa-cloud" style={{color: "#b197fc"}}></i>} 
    </button>
  )
}
