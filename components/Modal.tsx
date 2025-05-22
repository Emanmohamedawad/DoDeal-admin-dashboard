import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axios";
import Button from "./Button";
import { UserFormData, validateUserForm } from "../utils/validation";
import type { AppDispatch } from "../store";
import { useDispatch } from "react-redux";
import { createUser, editUser } from "../store/userSlice";
import type { User } from "../store/userSlice";
import type { AsyncThunkAction } from "@reduxjs/toolkit";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: User & { id?: number };
}

interface FormState {
  data: UserFormData;
  errors: FormErrors;
  isSubmitting: boolean;
  apiError: string | null;
}

interface FormErrors {
  [key: string]: string;
}

interface EmailCheckResponse {
  exists: boolean;
}

const INITIAL_FORM_STATE: UserFormData = {
  name: "",
  email: "",
  gender: "male",
  phone: "",
};

const useFormState = (initialData?: User & { id?: number }) => {
  const [formState, setFormState] = useState<FormState>({
    data: initialData
      ? { ...INITIAL_FORM_STATE, ...initialData }
      : INITIAL_FORM_STATE,
    errors: {},
    isSubmitting: false,
    apiError: null,
  });

  const resetForm = useCallback((data?: User & { id?: number }) => {
    setFormState({
      data: data ? { ...INITIAL_FORM_STATE, ...data } : INITIAL_FORM_STATE,
      errors: {},
      isSubmitting: false,
      apiError: null,
    });
  }, []);

  const updateFormField = useCallback((name: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
      errors: { ...prev.errors, [name]: undefined },
      apiError: null,
    }));
  }, []);

  return { formState, setFormState, resetForm, updateFormField };
};

// Helper type for async thunk actions
type AsyncThunkResult<T> = AsyncThunkAction<T, any, any>;

export default function Modal({ isOpen, onClose, initialData }: ModalProps) {
  const { t } = useTranslation("common");
  const dispatch = useDispatch<AppDispatch>();
  const { formState, setFormState, resetForm, updateFormField } =
    useFormState(initialData);

  useEffect(() => {
    if (isOpen) {
      resetForm(initialData);
    } else {
      resetForm();
    }
  }, [isOpen, initialData, resetForm]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      updateFormField(name, value);
    },
    [updateFormField]
  );

  const handleSubmit = useCallback(async () => {
    try {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
        errors: {},
        apiError: null,
      }));

      const validation = validateUserForm(formState.data);
      if (!validation.success) {
        const formErrors: FormErrors = {};
        validation.errors.forEach((err) => {
          formErrors[err.field] = t(
            `user.modal.validation.${err.field}.${err.message}`
          );
        });
        setFormState((prev) => ({ ...prev, errors: formErrors }));
        return;
      }

      // Prepare data for submission
      const submissionData = initialData?.id
        ? { ...initialData, ...formState.data } // Merge initialData and formState.data for edit
        : validation.data; // Use validated data for create

      const action = initialData?.id
        ? editUser({
            id: initialData.id,
            data: submissionData as Omit<User, "id">, // Use merged data for edit
          })
        : createUser(submissionData as Omit<User, "id">); // Use validated data for create

      // Type assertion to handle the async thunk action
      const result = await dispatch(action as AsyncThunkResult<any>);
      if ("error" in result) {
        throw result.error;
      }
      toast.dismiss(); // Close any open toasts
      toast.success(t(initialData ? "user.updateSuccess" : "user.createSuccess"), { onClose: onClose });

      // Introduce a small delay before closing the modal
      setTimeout(() => {
        onClose();
      }, 100); // Delay of 100ms
    } catch (error: any) {
      console.error("Form submission error:", error);
      const errorMessage =
        error?.response?.data?.error || error?.message || t("error.generic");
      setFormState((prev) => ({ ...prev, apiError: errorMessage }));
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [dispatch, formState.data, initialData, onClose, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <ModalHeader
          title={t(
            initialData ? "user.modal.title.edit" : "user.modal.title.create"
          )}
          onClose={onClose}
        />

        {formState.apiError && <ErrorMessage message={formState.apiError} />}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <FormField
            label={t("user.modal.form.name.label")}
            name="name"
            value={formState.data.name}
            onChange={handleChange}
            error={formState.errors.name}
            placeholder={t("user.modal.form.name.placeholder")}
          />

          <FormField
            label={t("user.modal.form.email.label")}
            name="email"
            type="email"
            value={formState.data.email}
            onChange={handleChange}
            error={formState.errors.email}
            placeholder={t("user.modal.form.email.placeholder")}
          />

          <FormField
            label={t("user.modal.form.phone.label")}
            name="phone"
            type="tel"
            value={formState.data.phone}
            onChange={handleChange}
            error={formState.errors.phone}
            placeholder={t("user.modal.form.phone.placeholder")}
          />

          <FormField
            label={t("user.modal.form.gender.label")}
            name="gender"
            type="select"
            value={formState.data.gender}
            onChange={handleChange}
            error={formState.errors.gender}
            options={[
              {
                value: "male",
                label: t("user.modal.form.gender.options.male"),
              },
              {
                value: "female",
                label: t("user.modal.form.gender.options.female"),
              },
            ]}
          />

          <ModalFooter
            onCancel={onClose}
            onSubmit={handleSubmit}
            isSubmitting={formState.isSubmitting}
            submitLabel={t(
              initialData ? "user.button.edit" : "user.button.create"
            )}
            cancelLabel={t("user.cancel")}
          />
        </form>
      </div>
    </div>
  );
}

const ModalHeader = ({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">{title}</h2>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
      <CloseIcon />
    </button>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
    <div className="flex">
      <div className="flex-shrink-0">
        <ErrorIcon />
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>
    </div>
  </div>
);

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  options,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "select";
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  error?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {type === "select" && options ? (
      <select
        name={name}
        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4f772d] focus:border-[#4f772d] ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        name={name}
        type={type}
        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4f772d] focus:border-[#4f772d] ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    )}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const ModalFooter = ({
  onCancel,
  onSubmit,
  isSubmitting,
  submitLabel,
  cancelLabel,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
}) => (
  <div className="flex justify-between space-x-2 mt-6">
    <Button
      onClick={onCancel}
      disabled={isSubmitting}
      className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-md p-2"
    >
      {cancelLabel}
    </Button>
    <Button
      onClick={onSubmit}
      disabled={isSubmitting}
      className="bg-[#4f772d] text-white hover:bg-[#132a13] disabled:opacity-50 border-0 rounded-md p-2 flex items-center gap-2"
    >
      {isSubmitting ? (
        <>
          <LoadingSpinner />
          {submitLabel}
        </>
      ) : (
        <>
          {submitLabel === "user.button.edit" ? <EditIcon /> : <AddIcon />}
          {submitLabel}
        </>
      )}
    </Button>
  </div>
);

const CloseIcon = () => (
  <svg
    className="h-6 w-6"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  </svg>
);

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const EditIcon = () => (
  <svg
    className="h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const AddIcon = () => (
  <svg
    className="h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);
