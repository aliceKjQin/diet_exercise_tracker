import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "@/app/dashboard/Dashboard";
import Calendar from "@/app/dashboard/Calendar";
import { useAuth } from "@/contexts/AuthContext";
import NoteModal from "@/app/dashboard/NoteModal";
import ReasonModal from "@/app/dashboard/ReasonModal";
import { doc, setDoc } from "firebase/firestore";

jest.mock("@/contexts/AuthContext");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({
    /* mock db object */
  })),
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock("@/app/dashboard/ReasonModal", () =>
  jest.fn(({ onSave }) => (
    <div>
      Mocked ReasonModal
      <button onClick={() => onSave("Test Reason")}>Save Reason</button>
    </div>
  ))
);

describe("Dashboard Component", () => {
  beforeEach(() => {
    // Mock the `doc` function to return a fake document reference
    doc.mockReturnValue("mockedDocRef");

    // Mock the `setDoc` function to resolve successfully
    setDoc.mockResolvedValueOnce();
  });

  test("renders loading spinner when user data is loading", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(<Dashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("redirects to login page when no user is logged in", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Dashboard />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test("displays today's activities with buttons for Diet, Exercise, and Note", () => {
    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: {
        name: "Test Diet",
        details: {
          dietData: {},
        },
      },
      loading: false,
    });

    render(<Dashboard />);
    expect(screen.getByText(/today's activities/i)).toBeInTheDocument();
    expect(screen.getByLabelText("diet-button")).toBeInTheDocument();
    expect(screen.getByLabelText("exercise-button")).toBeInTheDocument();
    expect(screen.getByLabelText("note-button")).toBeInTheDocument();
  });

  test("opens the NoteModal and saves a note", async () => {
    // Mock the current date
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = now.getMonth().toString(); // Zero-indexed
    const day = now.getDate().toString();

    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: {
        name: "Test Diet",
        details: {
          dietData: {},
        },
      },
      loading: false,
    });

    render(<Dashboard />);
    // Expect "note-icon" to not be in the document initially
    expect(screen.queryByLabelText("note-icon")).not.toBeInTheDocument();

    const noteButton = screen.getByLabelText("note-button");

    fireEvent.click(noteButton);
    expect(await screen.findByText("Add Note")).toBeInTheDocument(); // note modal opened

    const noteInput = screen.getByLabelText("note-input");
    fireEvent.change(noteInput, { target: { value: "test note" } });

    const saveButton = screen.getByText(/save/i);
    fireEvent.click(saveButton);

    expect(setDoc).toHaveBeenCalledWith(
      "mockedDocRef",
      expect.objectContaining({
        diets: expect.objectContaining({
          "Test Diet": expect.objectContaining({
            dietData: expect.objectContaining({
              [year]: { [month]: { [day]: { note: "test note" } } },
            }),
          }),
        }),
      }),
      { merge: true }
    );
    expect(screen.getByLabelText("note-icon")).toBeInTheDocument(); // note icon should display in calendar cell after the note is saved
  });

  test("renders the Calendar component with prop dietData from activeDiet to show matching face and note icon", () => {
    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: {
        name: "Test Diet",
        details: {
          dietData: {
            2024: {
              11: { 8: { diet: true, exercise: true, note: "test notes" } }, // should render a smiley face since both diet and exercise are completed
            },
          },
        },
      },
      loading: false,
    });

    render(<Dashboard />);
    expect(screen.getByLabelText("green-smiley-face")).toBeInTheDocument();
    expect(screen.getByLabelText("note-icon")).toBeInTheDocument();
  });
});
