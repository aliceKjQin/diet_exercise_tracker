import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import ProgressPage from "@/app/progress/page";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useWeightUnit } from "@/contexts/WeightUnitContext";

jest.mock("@/contexts/AuthContext");
jest.mock("@/contexts/WeightUnitContext");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  arrayRemove: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  deleteObject: jest.fn(),
}));
jest.mock("@/components/shared/ReviewNotes", () =>
  jest.fn(() => <div>Mocked ReviewNotes</div>)
);

describe("ProgressPage Component", () => {
  beforeEach(() => {
    // Mock the necessary context and Firebase methods
    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: {
        name: "Test Diet",
        details: {
          targetDays: 30,
          dietData: {},
          initialWeight: 70,
          targetWeight: 65,
          images: [
            { uid: "test-image-uid", url: "test-url", date: "2024-12-08" },
          ],
        },
      },
      loading: false,
    });
    useWeightUnit.mockReturnValue({ weightUnit: "kg" });

    doc.mockReturnValue("mockedDocReference");
    updateDoc.mockResolvedValueOnce();
    arrayRemove.mockReturnValue("mockedArrayRemove");
    ref.mockReturnValue("mockedStorageRef");
    deleteObject.mockResolvedValueOnce();
  });

  test("renders loading spinner when user data is loading", () => {
    useAuth.mockReturnValue({
      user: null,
      activeDiet: null,
      loading: true,
    });

    render(<ProgressPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders Login component when no user is logged in", () => {
    useAuth.mockReturnValue({
      user: null,
      activeDiet: null,
      loading: false,
    });

    render(<ProgressPage />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test("renders progress overview components when user and activeDiet are available", async () => {
    await act(async () => render(<ProgressPage />));

    expect(screen.getByText(/progress overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Days Left | target: (D)/i)).toBeInTheDocument();
    expect(screen.getByText(/% to target weight/i)).toBeInTheDocument();
    expect(screen.getByText(/mocked reviewnotes/i)).toBeInTheDocument();
    expect(
      screen.getByText(/document your transformation/i)
    ).toBeInTheDocument();
  });

  test("handles image deletion", async () => {
    render(<ProgressPage />);
    const deleteButton = screen.getByLabelText("delete-image-button");

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteObject).toHaveBeenCalledWith("mockedStorageRef");
      expect(updateDoc).toHaveBeenCalledWith(
        "mockedDocReference",
        expect.objectContaining({
          [`diets.Test Diet.images`]: "mockedArrayRemove",
        })
      );
    });
  });
});
