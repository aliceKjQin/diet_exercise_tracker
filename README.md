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
            "initialBodyImage": null
            "dietData": {
              ["2024"]: {
                ["1"]: {
                  ["15"]: { "diet": true, "exercise": true }
                  ["16"]: { 
                    "diet": true,
                    "note": "got an event today, wasn't able to get exercise done"
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
            "dietData": {
              ["2024"]: {
                ["9"]: {
                  ["15"]: {  
                           "diet": true,
                           "exercise": true,
                           "note": "had yogurt for breakie; lunch: brown rice, chicken, broccoli; didn't ate dinner as not feeling hungry."
                  }
                  ["16"]: { "exercise": true },
                  // ...
                },
              },
            },
          },
      },
    },
  },
}

App Flow & Logic:

Home Page:
 Users fill dietPlanForm, once submitted, redirect to dashboard page to start the tracking journey.

Dashboard Page:
 User can add diet and exercise emoji to mark if they have followed the diet and exercise for the day on calendar, and option to add a note as well. There will be a "View Current Progress" button on top of the calendar that direct user to the result/progress page that shows the user's current progress: i.e. currentTotalDays towards targetDays, currentWeight towards targetWeight, and progress towards. Display progress as percentage in a bar shape.

Result/Progress Page:
Showing currentTotalDays toward targetDays and currentWeight toward targetWeight in a percentage-based progress bar, some other relevant stats.

??could consider adding a motivational message or a visual cue (like changing the bar color as progress nears completion) to make the experience more engaging.

View Diet History Page:
 Display a list of passed/completed diets and final results, isActive = false.

 ?? Consider allowing users to compare past diets on metrics like success rate, weight loss, or duration to add more value to this page.