// Validation for the add pantry items input in MyPantry
export const validateAddItemInput = (input) => {
    const trimmedInput = input.trim();
  
    // Regex to match items separated by commas, optionally with spaces
    // (?:\s[a-zA-Z0-9]+)*: Matches optional multi-word items separated by spaces (e.g., "apple juice").
    const validRegex =
      /^([a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*)(,\s*[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*)*$/;
  
    if (!validRegex.test(trimmedInput)) {
      return {
        valid: false,
        message:
          'Invalid format. Items must be separated by commas, like "egg, apple, milk"',
      };
    }
  
    return {valid: true};
  };