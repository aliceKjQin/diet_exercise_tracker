
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