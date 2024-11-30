'use client'

import { useState, useEffect } from "react"
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore"
import { db } from "@/firebase"

export const usePantry = (userId, activeDietName) => {
    const [pantry, setPantry] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch pantry items from db
    const fetchPantry = async () => {
        try {
            setLoading(true)
            const userRef = doc(db, "users", userId)
            const docSnap = await getDoc(userRef)

            if(docSnap.exists()) {
                const userData = docSnap.data()
                const dietData = userData.diets?.[activeDietName]

    
                // If pantry field doesn't exist, initialize it db
                if (!dietData?.pantry) {
                    await updateDoc(userRef, {
                        [`diets.${activeDietName}.pantry`]: []
                    });
                    setPantry([]);
                } else {
                    setPantry(dietData.pantry || [])
                }
            }
        } catch (error) {
            console.error("Error fetching pantry: ", error)
        } finally {
            setLoading(false)
        }
    }

    // Add pantry item
    const addPantryItem = async (newItem) => {
        try {
            const userRef = doc(db, "users", userId)

            // Check for duplicates
            if (pantry.includes(newItem)) {
                return { success: false, message: "Item already exists in the pantry."}
            }

            // Update db
            await updateDoc(userRef, {
                [`diets.${activeDietName}.pantry`]: arrayUnion(newItem)
            })

            // Update local state
            setPantry((prev) => [...prev, newItem])

            return { success: true }
        } catch (error) {
            console.error("Error adding pantry item: ", error)
            return { success: false, message: "Failed to add item, please try again." }
        }
    };

    // Remove pantry item
    const removePantryItem = async (itemToRemove) => {
        try {
            const userRef = doc(db, "users", userId)

            // Update db
            await updateDoc(userRef, {
                [`diets.${activeDietName}.pantry`]: arrayRemove(itemToRemove)
            });

            // Update local state
            setPantry((prev) => prev.filter(item => item !== itemToRemove))

            return { success: true }
        } catch (error) {
            console.error("Error Removing pantry item: ", error)
            return { success: false, message: "Failed to remove item, please try again." }
        }
    };

    useEffect(() => {
        // wait for both userId and activeDietName exist to fetch the pantry items
        if(userId && activeDietName) {
            fetchPantry()
        }
    }, [userId, activeDietName]) // Refetch when userId or activeDietName changes

    return { pantry, loading, addPantryItem, removePantryItem, fetchPantry}
}