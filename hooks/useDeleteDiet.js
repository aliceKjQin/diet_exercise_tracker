import { db, storage } from "@/firebase";
import { doc, updateDoc, deleteField, getDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export function useDeleteDiet() {
  const deleteDiet = async (userId, dietName) => {
    if (!userId || !dietName) return;

    try {
      const userRef = doc(db, "users", userId);

      // Fetch the diet data first to check for image URLs
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const dietData = userData?.diets?.[dietName];

      // Remove the diet data from Firestore
      await updateDoc(userRef, {
        [`diets.${dietName}`]: deleteField(), // Remove the diet
      });

      // Delete the initialBodyImage from Firebase Storage
      if (dietData?.initialBodyImage) {
        const storageRef = ref(
          storage,
          `users/${userId}/diets/${dietName}/initialBodyImage.jpg`
        );
        await deleteObject(storageRef);
      }

      // Delete the currentBodyImage from Firebase Storage
      if (dietData?.currentBodyImage) {
        const storageRef = ref(
          storage,
          `users/${userId}/diets/${dietName}/currentBodyImage.jpg`
        );
        await deleteObject(storageRef);
      }

      console.log(`Successfully deleted diet: ${dietName}`);
      return true;
    } catch (error) {
      console.error("Error removing diet:", error);
    }
  };

  return { deleteDiet };
}
