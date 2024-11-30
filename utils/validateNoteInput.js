
// Validation function for the note input in NoteModal and FinalResultForm
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


