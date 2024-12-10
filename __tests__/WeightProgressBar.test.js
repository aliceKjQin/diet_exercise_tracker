import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import WeightProgressBar from "@/app/progress/WeightProgressBar";
import { useAuth } from "@/contexts/AuthContext";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { updateDoc } from "firebase/firestore";

jest.mock("@/contexts/AuthContext");
jest.mock("@/contexts/WeightUnitContext", () => ({
  useWeightUnit: jest.fn(),
}));
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  updateDoc: jest.fn(),
}));

describe("WeightProgressBar Component", () => {
  test("renders WeightProgressBar with initial data", () => {
    useAuth.mockReturnValue({
      activeDiet: { name: "diet1", details: { currentWeight: 80 } },
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(
      <WeightProgressBar
        startingWeight={80}
        targetWeight={70}
        userId="user1"
        isActive={true}
      />
    );

    // Check if the progress bar renders correctly
    expect(screen.getByText("0% to Target Weight 70 (kg)")).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Weight \(kg\):/)).toBeInTheDocument();
  });

  test("correctly calculates the progress percentage", () => {
    useAuth.mockReturnValue({
      activeDiet: { name: "diet1", details: { currentWeight: 75 } },
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(
      <WeightProgressBar
        startingWeight={80}
        targetWeight={70}
        userId="user1"
        isActive={true}
      />
    );

    const progressText = screen.getByText(/% to Target Weight/);
    expect(progressText.textContent).toBe("50% to Target Weight 70 (kg)"); // 50% progress from 80 to 70 with current weight 75
  });

  test("updates input weight and shows error for invalid input", () => {
    useAuth.mockReturnValue({
      activeDiet: { name: "diet1", details: { currentWeight: 70 } },
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(
      <WeightProgressBar
        startingWeight={80}
        targetWeight={70}
        userId="user1"
        inactiveDiet={null}
        isActive={true}
      />
    );

    const inputField = screen.getByLabelText(/Current Weight \(kg\):/);

    fireEvent.change(inputField, { target: { value: "75" } });
    expect(inputField.value).toBe("75"); // Input value should update to 75

    fireEvent.change(inputField, { target: { value: "invalid" } });
    expect(screen.getByText(/Please enter a valid number/)).toBeInTheDocument(); // Error message should appear
  });

  test("successfully updates weight when Save button is clicked", async () => {
    useAuth.mockReturnValue({
      activeDiet: { name: "diet1", details: { currentWeight: 70 } },
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(
      <WeightProgressBar
        startingWeight={80}
        targetWeight={70}
        userId="user1"
        isActive={true}
      />
    );

    const inputField = screen.getByLabelText(/Current Weight \(kg\):/);
    const saveButton = screen.getByRole("button");

    fireEvent.change(inputField, { target: { value: "75" } });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled(); // Ensure the updateDoc function is called
      expect(
        screen.getByText(/Weight updated successfully/i)
      ).toBeInTheDocument(); // Success message should appear
    });
  });

  test("displays success message after save updated weight", async () => {
    useAuth.mockReturnValue({
      activeDiet: { name: "diet1", details: { currentWeight: 70 } },
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(
      <WeightProgressBar
        startingWeight={80}
        targetWeight={70}
        userId="user1"
        isActive={true}
      />
    );

    const inputField = screen.getByLabelText(/Current Weight \(kg\):/);
    const saveButton = screen.getByRole("button");

    await act(async () => {
      fireEvent.change(inputField, { target: { value: "75" } });
      fireEvent.click(saveButton);
    });

    expect(
      screen.getByText("Weight updated successfully!")
    ).toBeInTheDocument(); // Check if the loading spinner appears
  });

  test("displays final weight for inactive diets", () => {
    useAuth.mockReturnValue({
      activeDiet: null,
      refetchActiveDiet: jest.fn(),
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    render(
      <WeightProgressBar
        startingWeight={80}
        targetWeight={70}
        userId="user1"
        inactiveDiet={{ details: { currentWeight: 75 } }}
        isActive={false}
      />
    );

    expect(screen.getByText(/Final Weight: 75 \(kg\)/)).toBeInTheDocument(); // Should show final weight for inactive diet
  });
});
