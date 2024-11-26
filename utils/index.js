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

  return { valid: true }; // Valid input
};

export const validateEmail = (email) => {
  const maxLength = 254;
  const trimmedEmail = email.trim();

  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;


  if (trimmedEmail.length > maxLength) {
    return {
      valid: false,
      message: `Email exceeds maximum length of ${maxLength} characters.`,
    };
  }

  // Check the overall structure
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, message: "Invalid email format." };
  }

  return { valid: true };
};

export const validatePassword = (password) => {
  const minLength = 8;
  const maxLength = 64; // Optional, based on app's needs.
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasSpace = /\s/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters long.` };
  }

  if (password.length > maxLength) {
    return { valid: false, message: `Password must be no more than ${maxLength} characters long.` };
  }

  if (!hasUpperCase) {
    return { valid: false, message: "Password must include at least one uppercase letter." };
  }

  if (!hasLowerCase) {
    return { valid: false, message: "Password must include at least one lowercase letter." };
  }

  if (!hasNumber) {
    return { valid: false, message: "Password must include at least one number." };
  }

  if (!hasSpecialChar) {
    return { valid: false, message: "Password must include at least one special character i.e.,!@#." };
  }

  if (hasSpace) {
    return { valid: false, message: "Password cannot contain spaces." };
  }

  return { valid: true, message: null };
};

