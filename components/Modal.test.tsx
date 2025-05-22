import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Modal from "./Modal";
import "@testing-library/jest-dom";
import { useTranslation } from "next-i18next";
import { useDispatch } from "react-redux";
import { createUser, editUser, User } from "../store/userSlice"; // Import User type
import { UserFormData, validateUserForm } from "../utils/validation";
import { toast } from "react-toastify";
import {
  Dispatch,
  UnknownAction,
  AsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit"; // Import types for Dispatch

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock translation function
  }),
}));

// Mock react-redux
// Use a factory function to return the mocked module structure
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"), // Keep actual imports for other exports if needed
  useDispatch: jest.fn(),
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => null,
}));

// Mock your Redux thunks (using a factory to control the mocks)
jest.mock("../store/userSlice", () => ({
  ...jest.requireActual("../store/userSlice"), // Keep actual imports like User type
  createUser: jest.fn(),
  editUser: jest.fn(),
}));

// Mock validateUserForm from your validation utility (using a factory to control the mocks)
jest.mock("../utils/validation", () => ({
  ...jest.requireActual("../utils/validation"), // Keep actual imports like UserFormData type
  validateUserForm: jest.fn(),
}));

// Helper type for a mocked async thunk action creator
type MockAsyncThunkActionCreator<Args extends any[], ReturnType> = jest.Mock<
  (...args: Args) => AsyncThunk<ReturnType, any, any>
>;

describe("Modal", () => {
  const mockOnClose = jest.fn();

  const mockUseDispatch = useDispatch as unknown as jest.Mock<
    () => Dispatch<UnknownAction>
  >;
  const mockCreateUser = createUser as unknown as MockAsyncThunkActionCreator<
    [Omit<User, "id">], 
    any 
  >;
  const mockEditUser = editUser as unknown as MockAsyncThunkActionCreator<
    [{ id: number; data: Omit<User, "id"> }], 
    any 
  >;
  const mockValidateUserForm = validateUserForm as jest.Mock;

  let mockDispatch: jest.Mock<Dispatch<UnknownAction>>; 

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Set the return value of the mocked hook to a new mock function for each test
    mockDispatch = jest.fn();
    mockUseDispatch.mockReturnValue(mockDispatch);

    // Default successful validation mock
    mockValidateUserForm.mockReturnValue({
      success: true,
      data: {
        name: "Test",
        email: "test@example.com",
        gender: "male",
        phone: "12345",
      },
    });

    // Default successful Redux dispatch mock implementation for the mockDispatch instance
    // This simulates how dispatch handles async thunks and returns promises with .unwrap()
    mockDispatch.mockImplementation((action: any) => {
      // Check if it's a thunk action (a function)
      if (typeof action === "function") {
        // When the thunk is executed by dispatch, it returns a promise. We mock that promise.
        // The .unwrap() call expects this promise to resolve with an object containing 'payload', 'meta', 'type'.
        // We need to call the thunk function itself to potentially trigger side effects or internal logic if the thunk mock needs it,
        // but for simply mocking the dispatch return value for .unwrap(), we can return a resolved promise directly.
        // A more realistic mock would execute the thunk and then wrap its promise result.
        // Let's simplify and mock the result that .unwrap() expects from a fulfilled thunk.
        return Promise.resolve({ payload: {}, meta: {}, type: "fulfilled" }); // Simulate successful async operation result for .unwrap()
      }
      // Return action itself for regular actions
      return action;
    });

    // Mock the thunk creators (`createUser`, `editUser`) to return a mock thunk function
    // This mock thunk function will be what `dispatch` receives and executes.
    // When executed, this mock thunk will return a promise that .unwrap() can use.
    // We need to ensure the resolved value matches the expected structure of a fulfilled async thunk result.
    mockCreateUser.mockImplementation((data: Omit<User, "id">) => {
      // This is the thunk action creator. It returns a thunk function.
      return jest
        .fn()
        .mockResolvedValue({ payload: data, meta: {}, type: "fulfilled" }); // Simulate a fulfilled thunk action result
    });

    mockEditUser.mockImplementation(
      (params: { id: number; data: Omit<User, "id"> }) => {
        // This is the thunk action creator. It returns a thunk function.
        return jest.fn().mockResolvedValue({
          payload: { id: params.id, ...params.data },
          meta: {},
          type: "fulfilled",
        }); // Simulate a fulfilled thunk action result
      }
    );
  });

  test("does not render when isOpen is false", () => {
    render(<Modal isOpen={false} onClose={mockOnClose} />);
    const modalElement = screen.queryByRole("dialog");
    expect(modalElement).not.toBeInTheDocument();
  });

  test("renders when isOpen is true", () => {
    render(<Modal isOpen={true} onClose={mockOnClose} />);
    const modalElement = screen.getByRole("dialog");
    expect(modalElement).toBeInTheDocument();
    expect(screen.getByText("user.modal.title.create")).toBeInTheDocument();
    expect(screen.getByText("user.cancel")).toBeInTheDocument();
    expect(screen.getByText("user.button.create")).toBeInTheDocument();
  });

  test("displays initial data in edit mode", () => {
    const initialUserData: User = {
      // Use the User type and ensure gender is correct
      id: 1,
      name: "Existing User",
      email: "existing@example.com",
      gender: "female", // Corrected gender type
      phone: "98765",
    };
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        initialData={initialUserData}
      />
    );

    expect(screen.getByLabelText("user.modal.form.name.label")).toHaveValue(
      "Existing User"
    );
    expect(screen.getByLabelText("user.modal.form.email.label")).toHaveValue(
      "existing@example.com"
    );
    expect(screen.getByLabelText("user.modal.form.phone.label")).toHaveValue(
      "98765"
    );
    expect(screen.getByLabelText("user.modal.form.gender.label")).toHaveValue(
      "female"
    );
    expect(screen.getByText("user.modal.title.edit")).toBeInTheDocument();
  });

  test("updates form state on input change", () => {
    render(<Modal isOpen={true} onClose={mockOnClose} />);
    const nameInput = screen.getByLabelText("user.modal.form.name.label");

    fireEvent.change(nameInput, {
      target: { name: "name", value: "New Name" },
    });

    expect(nameInput).toHaveValue("New Name");
  });

  test("displays validation errors", async () => {
    mockValidateUserForm.mockReturnValue({
      success: false,
      errors: [{ field: "name", message: "required" }],
    });

    render(<Modal isOpen={true} onClose={mockOnClose} />);
    const submitButton = screen.getByText("user.button.create");

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("user.modal.validation.name.required")
      ).toBeInTheDocument();
    });
  });

  test("dispatches createUser and calls onClose on successful creation", async () => {
    const newUserFormData: Omit<User, "id"> = {
      name: "New User",
      email: "new@example.com",
      gender: "male",
      phone: "1111",
    };
    mockValidateUserForm.mockReturnValue({
      success: true,
      data: newUserFormData,
    });

    // Configure the mock thunk to resolve successfully
    mockCreateUser.mockImplementation((data: Omit<User, "id">) => {
      return jest.fn().mockResolvedValue({
        payload: { id: 5, ...data },
        meta: {},
        type: "fulfilled",
      });
    });

    render(<Modal isOpen={true} onClose={mockOnClose} />);
    const submitButton = screen.getByText("user.button.create");

    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check if createUser thunk action creator was called with correct data
      expect(mockCreateUser).toHaveBeenCalledWith(newUserFormData);
      // Check if the thunk function returned by the action creator was dispatched
      const dispatchedThunk = mockCreateUser.mock.results[0].value;
      expect(mockDispatch).toHaveBeenCalledWith(dispatchedThunk);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith("user.createSuccess");
    });
  });

  test("dispatches editUser and calls onClose on successful edit", async () => {
    const initialUserData: User = {
      id: 1,
      name: "Existing User",
      email: "existing@example.com",
      gender: "female", // Corrected gender type
      phone: "98765",
    };
    const updatedUserData: Omit<User, "id"> = {
      // Use Omit for data sent in body
      name: "Updated User",
      email: "updated@example.com",
      gender: "male", // Corrected gender type
      phone: "54321",
    };

    mockValidateUserForm.mockReturnValue({
      success: true,
      data: updatedUserData,
    });

    mockEditUser.mockImplementation(
      (params: { id: number; data: Omit<User, "id"> }) => {
        return jest.fn().mockResolvedValue({
          payload: { id: params.id, ...params.data },
          meta: {},
          type: "fulfilled",
        });
      }
    );

    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        initialData={initialUserData}
      />
    );
    const submitButton = screen.getByText("user.button.edit");

    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check if editUser thunk action creator was called
      expect(mockEditUser).toHaveBeenCalledWith({
        id: 1,
        data: updatedUserData,
      });
      // Check if the thunk function returned by the action creator was dispatched
      const dispatchedThunk = mockEditUser.mock.results[0].value;
      expect(mockDispatch).toHaveBeenCalledWith(dispatchedThunk);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith("user.updateSuccess");
    });
  });

  test("displays email duplicate API error and does not close on creation failure", async () => {
    const duplicateUserFormData: Omit<User, "id"> = {
      name: "Duplicate",
      email: "duplicate@example.com",
      gender: "male",
      phone: "1111",
    };
    mockValidateUserForm.mockReturnValue({
      success: true,
      data: duplicateUserFormData,
    });

    const emailDuplicateError = {
      // Simulate Axios error structure for email duplicate
      response: { data: { error: "Email already exists" } },
      message: "Request failed with status code 400",
    };

    // Mock createUser thunk to reject with the specific API error
    mockCreateUser.mockImplementation((data: Omit<User, "id">) => {
      // The thunk returns a promise that rejects
      return jest.fn().mockRejectedValue(emailDuplicateError);
    });

    render(<Modal isOpen={true} onClose={mockOnClose} />);
    const submitButton = screen.getByText("user.button.create");

    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check if the API error message is displayed at the top
      // This should match the translated key due to the component's logic
      expect(
        screen.getByText("user.modal.validation.email.duplicate")
      ).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
      expect(submitButton).not.toBeDisabled(); // Check if the submit button is no longer disabled
    });
  });

  test("displays other API errors and re-throws", async () => {
    const formData: Omit<User, "id"> = {
      name: "Test",
      email: "test@example.com",
      gender: "male",
      phone: "1111",
    };
    mockValidateUserForm.mockReturnValue({
      success: true,
      data: formData,
    });

    const genericApiError = {
      // Simulate a generic Axios error structure
      response: { data: { error: "Some other API error" } },
      message: "Request failed with status code 500",
    };

    // Mock createUser thunk to reject with a different API error
    mockCreateUser.mockImplementation((data: Omit<User, "id">) => {
      // The thunk returns a promise that rejects
      return jest.fn().mockRejectedValue(genericApiError);
    });

    // Mock console.error to check if the error is logged
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<Modal isOpen={true} onClose={mockOnClose} />);
    const submitButton = screen.getByText("user.button.create");

    // React Testing Library's `fireEvent` doesn't propagate errors from async handlers easily.
    // To test the re-throwing behavior, we can check if console.error was called with the specific error
    // since our component logs and re-throws.
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check if the generic API error message is displayed in the modal
      const errorMessageElement =
        screen.queryByText("Some other API error") ||
        screen.queryByText("error.generic");
      expect(errorMessageElement).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
      expect(submitButton).not.toBeDisabled();
    });

    // Verify if the error was logged (optional but good for re-thrown errors)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Form submission error:",
      genericApiError
    );

    consoleErrorSpy.mockRestore(); // Restore console.error
  });

  // Add tests for closing modal with close button or escape key if implemented
  // test('calls onClose when close button is clicked', () => { ... });
  // test('calls onClose when escape key is pressed', () => { ... });
});
