import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UploadImage from "@/app/progress/UploadImage";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc, arrayUnion, getFirestore } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

jest.mock("@/contexts/AuthContext");
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(() => [{ uid: "666", url: "mockedDownloadUrl", date: "2024-12-08" }]),
}));
jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

describe("UploadImage Component", () => {
  const mockOnNewImageUpload = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ user: { uid: "123" } });
    doc.mockReturnValue("mockedDocReference");
    ref.mockReturnValue("mockedStorageRef");
    uploadBytes.mockResolvedValueOnce();
    getDownloadURL.mockResolvedValueOnce("mockedDownloadUrl");
  });

  test("renders the component with input fields and button", () => {
    render(
      <UploadImage
        dietName="TestDiet"
        onNewImageUpload={mockOnNewImageUpload}
      />
    );

    expect(screen.getByLabelText(/select an image/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select a date/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /upload image/i })
    ).toBeInTheDocument();
  });

  test("shows error when form is submitted without image or date", async () => {
    render(
      <UploadImage
        dietName="TestDiet"
        onNewImageUpload={mockOnNewImageUpload}
      />
    );
    const submitButton = screen.getByRole("button", { name: /upload image/i });

    fireEvent.click(submitButton);

    expect(
      screen.getByText(/please upload an image and select a date/i)
    ).toBeInTheDocument();
  });

  test("renders loading state while uploading", async () => {
    render(
      <UploadImage
        dietName="TestDiet"
        onNewImageUpload={mockOnNewImageUpload}
      />
    );
    const fileInput = screen.getByLabelText(/select an image/i);
    const dateInput = screen.getByLabelText(/select a date/i);
    const submitButton = screen.getByRole("button", { name: /upload image/i });

    const validFile = new File(["valid"], "valid.jpg", { type: "image/jpeg" });

    // Simulate user inputs
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    fireEvent.change(dateInput, { target: { value: "2024-12-08" } });

    // Click submit button
    fireEvent.click(submitButton);

    // Use waitFor to wait for the loading spinner to appear
    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

    test("shows error for invalid file type", () => {
      render(<UploadImage dietName="TestDiet" onNewImageUpload={mockOnNewImageUpload} />);
      const fileInput = screen.getByLabelText(/select an image/i);

      const invalidFile = new File(["(⌐□_□)"], "test.txt", { type: "text/plain" });
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(screen.getByText(/please upload a valid image/i)).toBeInTheDocument();
    });

  test("shows error for file size greater than 5 MB", () => {
      render(<UploadImage dietName="TestDiet" onNewImageUpload={mockOnNewImageUpload} />);
      const fileInput = screen.getByLabelText(/select an image/i);

      const largeFile = new File(["a".repeat(5 * 1024 * 1025)], "large.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(largeFile, "size", { value: 5 * 1024 * 1025 });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(screen.getByText(/file size must be less than 5 MB/i)).toBeInTheDocument();
    });

  test("uploads image and updates Firestore and parent state", async () => {
      render(<UploadImage dietName="TestDiet" onNewImageUpload={mockOnNewImageUpload} />);
      const fileInput = screen.getByLabelText(/select an image/i);
      const dateInput = screen.getByLabelText(/select a date/i);
      const submitButton = screen.getByRole("button", { name: /upload image/i });

      const validFile = new File(["valid"], "valid.jpg", { type: "image/jpeg" });

      // Simulate user inputs
      fireEvent.change(fileInput, { target: { files: [validFile] } });
      fireEvent.change(dateInput, { target: { value: "2024-12-08" } });
      fireEvent.click(submitButton);

      // Wait for async operations to complete
      await waitFor(() => {
        expect(uploadBytes).toHaveBeenCalledWith("mockedStorageRef", validFile);
        expect(getDownloadURL).toHaveBeenCalledWith("mockedStorageRef");
        expect(updateDoc).toHaveBeenCalledWith("mockedDocReference", {
            [`diets.TestDiet.images`]: expect.arrayContaining([
              expect.objectContaining({
                uid: "666",
                url: "mockedDownloadUrl",  // Mocked download URL
                date: "2024-12-08",
              }),
            ]),
          });
        expect(mockOnNewImageUpload).toHaveBeenCalledWith({
          uid: expect.any(String),
          url: "mockedDownloadUrl",
          date: "2024-12-08",
        });
        expect(screen.getByText(/image saved!/i)).toBeInTheDocument();
      });
    });
});
