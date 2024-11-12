import { NextResponse } from "next/server";

export async function POST(request) {
  const { pantryItems } = await request.json();
  console.log("Received pantry items:", pantryItems); // Add this line for debugging

  if (!pantryItems || !Array.isArray(pantryItems) || !pantryItems.length) {
    return NextResponse.json(
      { error: "No ingredients provided." },
      { status: 400 }
    );
  }

  const apiUrl = `https://api.edamam.com/api/nutrition-details?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`;

  console.log("API URL:", apiUrl); // Log API URL for debugging

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingr: pantryItems }),
    });

    console.log(
      "Payload sent to Edamam:",
      JSON.stringify({ ingr: pantryItems }, null, 2)
    );

    if (!response.ok) {
      // Try to parse the error response from Edamam
      const errorResponse = await response.json(); // Parse the response body
      const apiErrorMessage =
        errorResponse.error || "An unknown error occurred with Edamam API.";

      // Throw a specific error including the API's message
      throw new Error(apiErrorMessage);
    }

    const data = await response.json();

    console.log("Ingredients: ", JSON.stringify(data.ingredients, null, 2));

    // Parse data returned from Edamam
    const nutritionResults = data.ingredients.map((ingredient) => {
      const parsed = ingredient.parsed?.[0] || {}; // Safely access the first parsed obj
      const nutrients = parsed.nutrients || {};

      return {
        quantity: parsed.quantity || 1,
        unit: parsed.measure || "unit",
        food: parsed.food || "Unknown",
        calories: Math.round(nutrients.ENERC_KCAL?.quantity || 0),
        protein: Math.round(nutrients.PROCNT?.quantity || 0),
        fat: Math.round(nutrients.FAT?.quantity || 0),
        carbs: Math.round(nutrients.CHOCDF?.quantity || 0),
        fiber: Math.round(nutrients.FIBTG?.quantity || 0),
      };
    });

    return NextResponse.json({ nutritionResults });
  } catch (err) {
    console.log("Error from Edamam API call:", err.message); // Log the detailed error for debugging
    return NextResponse.json(
      {
        error:
          "Failed to calculate the nutrition for some ingredients. Please check the ingredient spelling or if you have entered a valid quantity for the ingredient.",
      },
      { status: 500 }
    ); // return user-friendly error message back to client
  }
}
