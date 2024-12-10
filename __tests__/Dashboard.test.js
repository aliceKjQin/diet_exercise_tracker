import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "@/app/dashboard/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
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

  test("displays today's activities with buttons for Diet, Exercise and Note, and Calendar when user is logged in", () => {
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
    expect(screen.getByLabelText("calendar-grid")).toBeInTheDocument();
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
              11: {
                // should render a green smiley face since both diet and exercise are completed, should render a note icon since note exists
                8: { diet: true, exercise: true, note: "test notes" },
                // should render a yellow meh face
                9: { diet: false, exercise: true },
                // should render a red sad face
                10: { diet: false, exercise: false },
              },
            },
          },
        },
      },
      loading: false,
    });

    render(<Dashboard />);
    expect(screen.getByLabelText("green-smiley-face")).toBeInTheDocument();
    expect(screen.getByLabelText("yellow-meh-face")).toBeInTheDocument();
    expect(screen.getByLabelText("red-sad-face")).toBeInTheDocument();
    expect(screen.getByLabelText("note-icon")).toBeInTheDocument();
  });

  test("opens ReasonModal when marked diet from true to false, saves the user's selected missed reason to db, updates the corresponding face icon after a missed reason is saved", () => {
    // Mock the current date
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // Zero-indexed
    const day = now.getDate();

    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: {
        name: "Test Diet",
        details: {
          dietData: {
            [year]: {
              [month]: { [day]: { diet: true, exercise: false } },
            },
          },
        },
      },
      loading: false,
    });

    render(<Dashboard />);
    // Render a yellow meh face initially since diet is true and exercise is false
    expect(screen.getByLabelText("yellow-meh-face")).toBeInTheDocument();

    // Click diet button should open the ReasonModal
    const dietButton = screen.getByLabelText("diet-button");
    fireEvent.click(dietButton);
    expect(screen.getByText("Why did you miss diet?")).toBeInTheDocument(); // ReasonModal opened

    // Find the radio input with value "Traveling"
    const travelingRadio = screen.getByRole("radio", { name: "Traveling" });
    // Select the "Traveling" option
    fireEvent.click(travelingRadio);
    // Expect the traveling radio button is checked
    expect(travelingRadio).toBeChecked();

    // Click save
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    expect(setDoc).toHaveBeenCalledWith(
      "mockedDocRef",
      expect.objectContaining({
        diets: expect.objectContaining({
          "Test Diet": expect.objectContaining({
            dietData: expect.objectContaining({
              [year]: {
                [month]: {
                  [day]: {
                    diet: false,
                    exercise: false,
                    dietMissedReason: "Traveling",
                  },
                },
              },
            }),
          }),
        }),
      }),
      { merge: true }
    );
    // Should update the face icon from a yellow-meh-face to a red-sad-face since both diet and exercise are false
    expect(screen.getByLabelText("red-sad-face")).toBeInTheDocument();
  });

  test("cancels on ReasonModal will toggle diet/exercise back to true(completed) and update corresponding face icon in Calendar", () => {
    // Mock the current date
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // Zero-indexed
    const day = now.getDate();

    useAuth.mockReturnValue({
      user: { uid: "123" },
      activeDiet: {
        name: "Test Diet",
        details: {
          dietData: {
            [year]: {
              [month]: { [day]: { diet: true, exercise: true } },
            },
          },
        },
      },
      loading: false,
    });

    render(<Dashboard />);

    // Expect a green-smiley-face initially
    expect(screen.getByLabelText("green-smiley-face")).toBeInTheDocument()

    // Get and click diet button, should open the ReasonModal, should show a yellow-meh-face 
    const dietButton = screen.getByLabelText("diet-button")
    fireEvent.click(dietButton)
    expect(screen.getByText("Why did you miss diet?"))
    expect(screen.getByLabelText("yellow-meh-face")).toBeInTheDocument()

    // Get and click cancel button, should toggle the diet back to completed and show a green face icon
    const cancelButton = screen.getByRole("button", {name: "Cancel"})
    fireEvent.click(cancelButton)
    expect(screen.getByLabelText("green-smiley-face")).toBeInTheDocument()
  });
});
