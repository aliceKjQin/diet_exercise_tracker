'use client'

import { createContext, useContext, useState } from "react";

const WeightUnitContext = createContext()

export const useWeightUnit = () => useContext(WeightUnitContext)

export const WeightUnitProvider = ({children}) => {
    const [weightUnit, setWeightUnit] = useState('kg')

    return (
        <WeightUnitContext.Provider value={{weightUnit, setWeightUnit}}>
            {children}
        </WeightUnitContext.Provider>
    )
}
