import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "@/app/page";
import { useAuth } from "@/contexts/AuthContext";
import { useWeightUnit } from "@/contexts/WeightUnitContext";

jest.mock("next/link", () => ({ children, ...props }) => (
  <a {...props}>{children}</a>
));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("next/image", () => ({ src, alt }) => <img src={src} alt={alt} />);
jest.mock("@/contexts/AuthContext");
jest.mock("@/contexts/WeightUnitContext");

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({
      /* mock db object */
    })),
    doc: jest.fn(),
    updateDoc: jest.fn(),
  }));

describe("Homepage Component", () => {
  test("renders loading spinner when user data is loading", () => {
    useAuth.mockReturnValue({
      user: null,
      activeDiet: null,
      loading: true,
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(<HomePage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders the preview modal for unauthorized users", () => {
    useAuth.mockReturnValue({
      user: null,
      activeDiet: null,
      loading: false,
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(<HomePage />);
    expect(
      screen.getByText(/explore diet & exercise tracker/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/close/i)).toBeInTheDocument();
  });

  test("renders the diet form when no active diet exists", () => {
    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: null,
      loading: false,
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(<HomePage />);
    expect(screen.getByText(/create diet plan/i)).toBeInTheDocument(); // Adjust text based on DietPlanForm content
  });

  test("renders active diet details when active diet exists", () => {
    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: {
        name: "keto",
        details: {
          startDate: "2024-12-01",
          targetDays: 30,
          targetWeight: 70,
          isActive: true,
        },
      },
      loading: false,
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(<HomePage />);

    const durationInput = screen.getByLabelText(/duration \(days\)/i);
    const targetWeightInput = screen.getByLabelText(/target weight \(kg\)/i);

    expect(screen.getByText(/current active diet:/i)).toBeInTheDocument();
    expect(screen.getByText(/keto/i)).toBeInTheDocument();
    expect(durationInput.value).toBe("30");
    expect(targetWeightInput.value).toBe("70");
  });

  test("updates targetDays and saves it to the database", async () => {
    const refetchActiveDiet = jest.fn();
    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: {
        name: "keto",
        details: {
          targetDays: 30,
        },
      },
      loading: false,
      refetchActiveDiet,
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(<HomePage />);

    // Find the input and its associated button specifically within the container for "targetDays"
    const targetDaysContainer = screen
      .getByLabelText(/duration \(days\)/i)
      .closest("div");
    const input =
      within(targetDaysContainer).getByLabelText(/duration \(days\)/i);
    const saveButton = within(targetDaysContainer).getByRole("button", {
      name: /update/i,
    });

    // Simulate input change
    fireEvent.change(input, { target: { value: "60" } });
    expect(input.value).toBe("60");

    // Click the save button
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(refetchActiveDiet).toHaveBeenCalled();
    });
  });

  test("displays error message for invalid input in targetDays", () => {
    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: {
        name: "keto",
        details: {
          targetDays: 30,
        },
      },
      loading: false,
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(<HomePage />);

    const input = screen.getByLabelText(/duration \(days\)/i);
    fireEvent.change(input, { target: { value: "abc" } });
    expect(
      screen.getByText(/please enter a valid whole number/i)
    ).toBeInTheDocument();
  });

  test("toggles instruction section visibility", () => {
    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: {
        name: "keto",
        details: {
          startDate: "2023-01-01",
          targetDays: 30,
          targetWeight: 70,
        },
      },
      loading: false,
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(<HomePage />);

    const toggleButton = screen.getByRole("button", { name: /new here/i });
    fireEvent.click(toggleButton);
    expect(screen.getByText("Quick Start Guide")).toBeInTheDocument();
  });
});
