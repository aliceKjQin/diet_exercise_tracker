import React from 'react'

export default function NutritionTableUI({nutritionResults}) {
  return (
    <div className="overflow-x-auto w-full">
              <table className="w-full border border-stone-300 bg-yellow-100 text-left">
                <thead className="bg-yellow-200">
                  <tr>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2">Food</th>
                    <th className="p-2">Protein</th>
                    <th className="p-2">Fat</th>
                    <th className="p-2">Fiber</th>
                    <th className="p-2">Carbs</th>
                    <th className="p-2">Calories</th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionResults.map((result, index) => (
                    <tr key={index}>
                      <td className="p-2">{result.quantity}</td>
                      <td className="p-2">{result.unit}</td>
                      <td className="p-2">{result.food}</td>
                      <td className="p-2">{`${result.protein} g`}</td>
                      <td className="p-2">{`${result.fat} g`}</td>
                      <td className="p-2">{`${result.fiber} g`}</td>
                      <td className="p-2">{`${result.carbs} g`}</td>
                      <td className="p-2">{`${result.calories} kcal`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  )
}
