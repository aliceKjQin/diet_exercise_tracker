DEMO DATA
{
    "users": {
      [userId]: { 
        "diets": {
          ["keto"]: {
            "targetDays": 90,
            "targetWeight": 100,
            "initialWeight": 120,
            ["currentWeight"]: 118,
            isActive: true // update the value to false once the targetDays is reached
            "initialBodyImage": null,
            "dietData": {
              ["2024"]: {
                ["1"]: {
                  ["15"]: { 
                    "diet": false,
                     "exercise": false,
                     "dietMissedReason": "Other: Friends in town", // "Other" option with custom reason
                     "exerciseMissedReason": "Other: Friends in town", // "Other" option with custom reason
                      }
                  ["17"]: {
                    "exercise": false,
                    "diet": true,
                    "note": "got an event today, wasn't able to get exercise done",
                    "exerciseMissedReason": "Conflict with schedule"  // Predefined reason
                   },
                  // ... * dietData: {} Initially empty, filled in as user progresses
                },
              },
            },
          },
          ["wholeFood"]: {
            "targetDays": 60,
            "idealGoalWeight": 100,
            "initialWeight": 120,
            ["currentWeight"]: 118,
            "initialBodyImage": initialImageUrl,
            "currentBodyImage": currentImageUrl,
            isActive: false,
            "dietData": {}
            },
          },
      },
    },
  }