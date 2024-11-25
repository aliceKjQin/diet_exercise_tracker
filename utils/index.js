// Validation function for the ingredients list input in NutritionAnalysis
export const validateIngredientInput = (input) => {
  const lines = input.trim().split("\n");

  const errors = [];
  // filter valid lines, which are the ones that return true
  const validLines = lines.filter((line, index) => {
    const trimmedLine = line.trim();

    // Check if the line contains a number or Unicode fraction
    const hasNumberOrFraction = /[\d\u00BC-\u00BE\u2150-\u215E]/.test(
      trimmedLine
    );
    const isValidFormat =
      /^[a-zA-Z0-9\s.,;()'/"\u00BC-\u00BE\u2150-\u215E-]*$/.test(trimmedLine); // \u00BC-\u00BE: Matches common fractions like ¼, ½, and ¾

    if (!(hasNumberOrFraction && isValidFormat)) {
      errors.push(`Line ${index + 1} is invalid: "${trimmedLine}"`);
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

// Validation function for the note input in NoteModal
export const validateNoteInput = (input) => {
  const trimmedInput = input.trim();
  // Define valid letters, numbers, spaces, punctuation, symbols and emojis
  const validNoteRegex = /^[a-zA-Z0-9\s.,;!?()'"*\-:\[\]@&%#^_+=|~`$^]*$/;
  const emojiRegex =
    /[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u26FF\u2700-\u27BF\u2B50\u231A\u1F004-\u1F0CF]/;

  // Check input exceeds 500 characters
  if (trimmedInput.length > 500) {
    return { valid: false, message: "Exceeds the 500 characters limit." };
  }

  //Check for forbidden characters (angle brackets and curly braces)
  if (/[<>{}]/.test(trimmedInput)) {
    return { valid: false, message: "<> and {} are not allowed." };
  }

  // Check for valid characters (letters, numbers, spaces, symbols, punctuation, emojis)
  if (!validNoteRegex.test(trimmedInput) && !emojiRegex.test(trimmedInput)) {
    return {
      valid: false,
      message:
        "Please enter a valid note. Only letters, numbers, spaces, emojis, common punctuation and symbols are allowed.",
    };
  }

  return { valid: true, message: null }; // Valid input
};

export const validateEmail = (email) => {
  const maxLength = 254;
  const trimmedEmail = email.trim();
  const emailRegex =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])*(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])*)+\.[a-z]{2,}$/i;

  if (trimmedEmail.length > maxLength) {
    return {
      valid: false,
      message: `Email exceeds maximum length of ${maxLength} characters.`,
    };
  }

  // Check the overall structure
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: "Invalid email structure." };
  }

  return { valid: true, error: null };
};
