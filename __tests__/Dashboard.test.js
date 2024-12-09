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
jest.mock("@/app/dashboard/Calendar", () =>
  jest.fn(() => <div>Mocked Calendar</div>)
);
jest.mock("@/app/dashboard/NoteModal", () =>
  jest.fn(({ onSave }) => (
    <div>
      Mocked NoteModal
      <button onClick={() => onSave("Test Note")}>Save Note</button>
    </div>
  ))
);
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
    expect(screen.getByText("Diet")).toBeInTheDocument();
    expect(screen.getByText("Exercise")).toBeInTheDocument();
    expect(screen.getByText("Add Note")).toBeInTheDocument();
  });

  test("opens the NoteModal and saves a note", async () => {
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
    const noteButton = screen.getByText(/add note/i);

    fireEvent.click(noteButton);
    expect(await screen.findByText(/mocked notemodal/i)).toBeInTheDocument();

    const saveButton = screen.getByText(/save note/i);
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(setDoc).toHaveBeenCalledWith(
        "mockedDocRef",
        expect.objectContaining({
          diets: expect.objectContaining({
            "Test Diet": expect.objectContaining({
              dietData: expect.any(Object),
            }),
          }),
        }),
        { merge: true }
      )
    );
  });

  test("renders the Calendar component with correct props", () => {
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
    expect(screen.getByText(/mocked calendar/i)).toBeInTheDocument();
  });
});
