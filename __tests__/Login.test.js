import {
    render,
    screen,
    fireEvent,
    act,
  } from "@testing-library/react";
  import Login from "@/app/login/Login";
  import { useAuth } from "@/contexts/AuthContext";
  import { useRouter } from "next/navigation";
  import "@testing-library/jest-dom";
  
  jest.mock("next/navigation", () => ({
    useRouter: jest.fn(), // Mock the hook
  }));
  
  jest.mock("@/contexts/AuthContext", () => ({
    useAuth: jest.fn(),
  }));
  
  describe("Login Component", () => {
    const mockPush = jest.fn();
    const mockSignup = jest.fn();
    const mockLogin = jest.fn();
    const mockSendPasswordReset = jest.fn();
  
    beforeEach(() => {
      // Mock useRouter
      useRouter.mockReturnValue({
        push: mockPush, // Mock the router's push method
      });
  
      // Mock useAuth
      useAuth.mockReturnValue({
        signup: mockSignup,
        login: mockLogin,
        sendPasswordReset: mockSendPasswordReset,
      });
    });
  
    test("renders Login component and interacts with elements", async () => {
      render(<Login />);
  
      // Assert that inputs and buttons are present
      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");
      const submitButton = screen.getByRole("button", { name: /Sign in/i });
  
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
  
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "passworD123!" } });
  
      await act(async () => {
        fireEvent.click(submitButton);
      });
  
      // Assert login function was called
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "passworD123!");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  
    test("registers a new user", async () => {
      render(<Login />);
  
      // Assert that inputs and buttons are present
      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");
      const switchToRegisterButton = screen.getByText(/Create account/i);
  
      // Switch to register mode by clicking the "Create account" button
      fireEvent.click(switchToRegisterButton); // switch to register mode
  
      // Assert confirm password input and create account button are present after switching to register mode
      const confirmPasswordInput =
        screen.getByPlaceholderText("Confirm Password");
      const submitButton = screen.getByRole("button", {
        name: /Create account/i,
      });
  
      // Simulate user input
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "passworD123!" } }); // Make sure the password value here pass the validation check else the test would fail
      fireEvent.change(confirmPasswordInput, {
        target: { value: "passworD123!" },
      });
  
      // Simulate click create account
      await act(async () => {
        fireEvent.click(submitButton);
      });
  
      // Assert that signup function was called
      expect(mockSignup).toHaveBeenCalledWith("test@example.com", "passworD123!");
      expect(mockPush).toHaveBeenCalledWith("/"); // Check if the router navigates
    });
  
    test("shows error when passwords don't match during registration", async () => {
      render(<Login />);
  
      // Assert that inputs and buttons are present
      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");
      const switchToRegisterButton = screen.getByText(/Create account/i);
  
      fireEvent.click(switchToRegisterButton); // switch to register mode
  
      // Assert confirm password input and create account button are present after switching to register mode
      const confirmPasswordInput =
        screen.getByPlaceholderText("Confirm Password");
      const submitButton = screen.getByRole("button", {
        name: /Create account/i,
      });
  
      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "newpassworD123!" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "wrongpassworD123!" },
      });
  
      await act(async () => {
        fireEvent.click(submitButton);
      });
  
      // Assert error message for mismatched passwords
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    });
  
    test("shows error when password is missing", async () => {
      render(<Login />);
  
      const emailInput = screen.getByPlaceholderText("Email");
      const submitButton = screen.getByRole("button", { name: /Sign in/i });
  
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  
      await act(async () => {
        fireEvent.click(submitButton);
      });
  
      // Assert error message for missing password
      expect(screen.getByText("Please enter your password.")).toBeInTheDocument();
    });
  
    test("handles password reset", async () => {
      render(<Login />);
  
      const emailInput = screen.getByPlaceholderText("Email");
      const forgotPasswordButton = screen.getByText("Forgot Password?");
  
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  
      await act(async () => {
        fireEvent.click(forgotPasswordButton);
      });
  
      // Assert sendPasswordReset function was called
      expect(mockSendPasswordReset).toHaveBeenCalledWith("test@example.com");
    });
  
    test("switches between login and register modes", async () => {
      render(<Login />);
  
      const switchButton = screen.getByText("Create account");
      const currentModeText = screen.getByText(
        "Welcome back. Sign in to continue"
      );
  
      // Verify the initial text in login mode
      expect(currentModeText).toBeInTheDocument();
  
      // Click to switch to register mode
      fireEvent.click(switchButton);
      expect(screen.getByText("Create an account")).toBeInTheDocument();
      expect(
        screen.queryByText("Welcome back. Sign in to continue")
      ).not.toBeInTheDocument();
    });
  });
  