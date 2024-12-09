// Validation for the add pantry items input in MyPantry
export const validateAddItemInput = (input) => {
  const trimmedInput = input.trim();

  // Allow single items or items separated by commas with optional spaces
  const validRegex = /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*(\s*,\s*[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*)*$/;

  // If input matches the regex but contains multiple words without commas, invalidate it
  const containsMultipleItemsWithoutCommas = /\s/.test(trimmedInput) && !trimmedInput.includes(',');

  if (!validRegex.test(trimmedInput) || containsMultipleItemsWithoutCommas) {
    return {
      valid: false,
      message:
        'Invalid format. Items must be separated by commas, like "egg, apple, milk"',
    };
  }

  return { valid: true };
};
