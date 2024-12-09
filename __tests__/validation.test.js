import {
  validateEmail,
  validatePassword,
} from "@/app/login/validateEmailNpassword";
import { validateAddItemInput } from "@/app/pantry/validateAddItemInput";
import { validateIngredientInput } from "@/app/pantry/validateIngredientInput";
import { validateNoteInput } from "@/utils/validateNoteInput";

describe("validateEmail", () => {
  test("should return valid for a correct email", () => {
    const result = validateEmail("test@example.com");
    expect(result).toEqual({ valid: true });
  });

  test("should return invalid for an email exceeding max length", () => {
    const longEmail = "a".repeat(255) + "@example.com";
    const result = validateEmail(longEmail);
    expect(result).toEqual({
      valid: false,
      message: "Email exceeds maximum length of 254 characters.",
    });
  });

  test("should return invalid for an incorrect email format", () => {
    const result = validateEmail("invalid-email");
    expect(result).toEqual({
      valid: false,
      message: "Invalid email format.",
    });
  });

  test("should trim whitespace and validate correctly", () => {
    const result = validateEmail("  test@example.com  ");
    expect(result).toEqual({ valid: true });
  });
});

describe("validatePassword", () => {
  test("should return valid for a strong password", () => {
    const result = validatePassword("StrongP@ssw0rd");
    expect(result).toEqual({ valid: true, message: null });
  });

  test("should return invalid for a password shorter than 8 characters", () => {
    const result = validatePassword("Short1!");
    expect(result).toEqual({
      valid: false,
      message: "Password must be at least 8 characters long.",
    });
  });

  test("should return invalid for a password longer than 64 characters", () => {
    const longPassword = "A".repeat(65) + "1!";
    const result = validatePassword(longPassword);
    expect(result).toEqual({
      valid: false,
      message: "Password must be no more than 64 characters long.",
    });
  });

  test("should return invalid if no uppercase letter is present", () => {
    const result = validatePassword("lowercase1!");
    expect(result).toEqual({
      valid: false,
      message: "Password must include at least one uppercase letter.",
    });
  });

  test("should return invalid if no lowercase letter is present", () => {
    const result = validatePassword("UPPERCASE1!");
    expect(result).toEqual({
      valid: false,
      message: "Password must include at least one lowercase letter.",
    });
  });

  test("should return invalid if no number is present", () => {
    const result = validatePassword("NoNumbers!");
    expect(result).toEqual({
      valid: false,
      message: "Password must include at least one number.",
    });
  });

  test("should return invalid if no special character is present", () => {
    const result = validatePassword("NoSpecial1");
    expect(result).toEqual({
      valid: false,
      message: "Password must include at least one special character i.e.,!@#.",
    });
  });

  test("should return invalid if spaces are present", () => {
    const result = validatePassword("No Spaces1!");
    expect(result).toEqual({
      valid: false,
      message: "Password cannot contain spaces.",
    });
  });
});

describe("validateAddItemInput", () => {
  test("valid input with single word items", () => {
    const input = "egg, apple, milk";
    const result = validateAddItemInput(input);
    expect(result).toEqual({ valid: true });
  });

  test("valid input with multi-word items", () => {
    const input = "apple juice, whole milk, chocolate bar";
    const result = validateAddItemInput(input);
    expect(result).toEqual({ valid: true });
  });

  test("valid input with extra spaces around commas", () => {
    const input = "egg ,  apple ,milk";
    const result = validateAddItemInput(input);
    expect(result).toEqual({ valid: true });
  });

  test("valid input with extra spaces around the input", () => {
    const input = "   egg, apple, milk   ";
    const result = validateAddItemInput(input);
    expect(result).toEqual({ valid: true });
  });

  test("invalid input with no commas", () => {
    const input = "egg apple milk";
    const result = validateAddItemInput(input);
    expect(result).toEqual({
      valid: false,
      message:
        'Invalid format. Items must be separated by commas, like "egg, apple, milk"',
    });
  });

  test("invalid input with invalid characters", () => {
    const input = "egg, apple, milk@!";
    const result = validateAddItemInput(input);
    expect(result).toEqual({
      valid: false,
      message:
        'Invalid format. Items must be separated by commas, like "egg, apple, milk"',
    });
  });

  test("invalid input with consecutive commas", () => {
    const input = "egg,, apple, milk";
    const result = validateAddItemInput(input);
    expect(result).toEqual({
      valid: false,
      message:
        'Invalid format. Items must be separated by commas, like "egg, apple, milk"',
    });
  });

  test("invalid input with empty string", () => {
    const input = "";
    const result = validateAddItemInput(input);
    expect(result).toEqual({
      valid: false,
      message:
        'Invalid format. Items must be separated by commas, like "egg, apple, milk"',
    });
  });

  test("invalid input with only spaces", () => {
    const input = "   ";
    const result = validateAddItemInput(input);
    expect(result).toEqual({
      valid: false,
      message:
        'Invalid format. Items must be separated by commas, like "egg, apple, milk"',
    });
  });

  test("invalid input with comma at the start", () => {
    const input = ",egg, apple, milk";
    const result = validateAddItemInput(input);
    expect(result).toEqual({
      valid: false,
      message:
        'Invalid format. Items must be separated by commas, like "egg, apple, milk"',
    });
  });

  test("invalid input with comma at the end", () => {
    const input = "egg, apple, milk,";
    const result = validateAddItemInput(input);
    expect(result).toEqual({
      valid: false,
      message:
        'Invalid format. Items must be separated by commas, like "egg, apple, milk"',
    });
  });
});

describe("validateIngredientInput", () => {
  test("valid input with multiple valid lines", () => {
    const input = "1 cup flour\n2 tbsp sugar\n3/4 cup milk";
    const result = validateIngredientInput(input);
    expect(result).toEqual({
      isValid: true,
      validLines: ["1 cup flour", "2 tbsp sugar", "3/4 cup milk"],
      errors: [],
    });
  });

  test("valid input with fractions and special characters", () => {
    const input = "½ cup butter\n¼ tsp salt\n1½ cups water";
    const result = validateIngredientInput(input);
    expect(result).toEqual({
      isValid: true,
      validLines: ["½ cup butter", "¼ tsp salt", "1½ cups water"],
      errors: [],
    });
  });

  test("invalid input with empty lines", () => {
    const input = "1 cup flour\n\n2 tbsp sugar";
    const result = validateIngredientInput(input);
    expect(result).toEqual({
      isValid: false,
      validLines: ["1 cup flour", "2 tbsp sugar"],
      errors: ['Line 2 is empty: ""'],
    });
  });

  test("invalid input with invalid characters", () => {
    const input = "1 cup flour\n2 tbsp sugar@\n!3 cups milk";
    const result = validateIngredientInput(input);
    expect(result).toEqual({
      isValid: false,
      validLines: ["1 cup flour"],
      errors: [
        'Line 2 is invalid: "2 tbsp sugar@"',
        'Line 3 is invalid: "!3 cups milk"',
      ],
    });
  });

  test("invalid input with no numbers or fractions", () => {
    const input = "flour\n2 tbsp sugar\nmilk";
    const result = validateIngredientInput(input);
    expect(result).toEqual({
      isValid: false,
      validLines: ["2 tbsp sugar"],
      errors: ['Line 1 is invalid: "flour"', 'Line 3 is invalid: "milk"'],
    });
  });

  test("valid input with edge case: valid Unicode fractions", () => {
    const input = "1 cup flour\n¾ tsp cinnamon\n2 cups milk";
    const result = validateIngredientInput(input);
    expect(result).toEqual({
      isValid: true,
      validLines: ["1 cup flour", "¾ tsp cinnamon", "2 cups milk"],
      errors: [],
    });
  });

  test("invalid input with special characters not allowed", () => {
    const input = "1 cup flour\n$2 tbsp sugar\n3/4 cup milk!";
    const result = validateIngredientInput(input);
    expect(result).toEqual({
      isValid: false,
      validLines: ["1 cup flour"],
      errors: [
        'Line 2 is invalid: "$2 tbsp sugar"',
        'Line 3 is invalid: "3/4 cup milk!"',
      ],
    });
  });
});

describe("validateNoteInput", () => {
    test("valid input with letters, numbers, punctuation, and emojis", () => {
      const input = "This is a valid note! 😊";
      const result = validateNoteInput(input);
      expect(result).toEqual({ valid: true });
    });
  
    test("invalid input exceeding 500 characters", () => {
      const input = "a".repeat(501); // A string of 501 'a' characters
      const result = validateNoteInput(input);
      expect(result).toEqual({
        valid: false,
        message: "Exceeds the 500 characters limit.",
      });
    });
  
    test("invalid input with forbidden characters", () => {
      const input = "This note contains forbidden characters: <, >, {, }";
      const result = validateNoteInput(input);
      expect(result).toEqual({
        valid: false,
        message: "<> and {} are not allowed.",
      });
    });
  
    test("empty input with spaces", () => {
      const input = "   ";
      const result = validateNoteInput(input);
      expect(result).toEqual({ valid: true });
    });
  
    test("valid input with special symbols", () => {
      const input = "Special symbols are allowed: @&%#^_+=|~$";
      const result = validateNoteInput(input);
      expect(result).toEqual({ valid: true });
    });
  });

