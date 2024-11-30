import { db, storage } from "@/firebase";
import { doc, updateDoc, deleteField, getDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export function useDeleteDiet() {
  const deleteDiet = async (userId, dietName) => {
    if (!userId || !dietName) return;

    try {
      const userRef = doc(db, "users", userId);

      // Fetch user data from db
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const dietData = userData?.diets?.[dietName];

      // Remove the diet data from Firestore
      await updateDoc(userRef, {
        [`diets.${dietName}`]: deleteField(), // Remove the diet
      });

      // Check if images exist and delete each one from storage
      if (dietData?.images?.length > 0) {
        for (const image of dietData.images) {
          if(image.uid) {
            const storageRef = ref(
              storage,
              `users/${userId}/diets/${dietName}/images/${image.uid}.jpg`
            )
            await deleteObject(storageRef)
          }
        }
      }

      console.log(`Successfully deleted diet: ${dietName}`);
      return true;
    } catch (error) {
      console.error("Error removing diet:", error);
      return false
    }
  };

  return { deleteDiet };
}
