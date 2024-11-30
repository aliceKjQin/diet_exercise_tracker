// Validation function for the ingredients list input in NutritionAnalysis
export const validateIngredientInput = (input) => {
    const lines = input.trim().split("\n");
  
    const errors = [];
    // filter valid lines, which are the ones that return true
    const validLines = lines.filter((line, index) => {
      const trimmedLine = line.trim();
  
      // Check if the line contains a number or Unicode fraction
      const hasValidNumberOrFraction = /[\d\u00BC-\u00BE\u2150-\u215E]/.test(
        trimmedLine
      );
      const isValidFormat =
        /^[a-zA-Z0-9\s.,;()'/"\u00BC-\u00BE\u2150-\u215E-]*$/.test(trimmedLine); // \u00BC-\u00BE: Matches common fractions like ¼, ½, and ¾
  
      if (!(hasValidNumberOrFraction && isValidFormat)) {
        if (trimmedLine === "") {
          errors.push(`Line ${index + 1} is empty: "${trimmedLine}"`);
        } else {
          errors.push(`Line ${index + 1} is invalid: "${trimmedLine}"`);
        }
        return false;
      }
  
      return true;
    });
  
    return {
      isValid: errors.length === 0,
      validLines,
      errors,
    };
  };
  