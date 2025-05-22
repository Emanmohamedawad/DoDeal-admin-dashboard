import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axios";
import Button from "./Button";
import { UserFormData, validateUserForm } from "../utils/validation";
import type { AppDispatch } from "../store";
import { useDispatch } from "react-redux";
import { createUser, editUser } from "../store/userSlice";
import type { User } from "../store/userSlice";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: User & { id?: number };
}

interface FormErrors {
  [key: string]: string;
}

interface EmailCheckResponse {
  exists: boolean;
}

export default function Modal({ isOpen, onClose, initialData }: Props) {
  const { t } = useTranslation("common");
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState<UserFormData>({
    name: "",
    email: "",
    gender: "male",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm(initialData as UserFormData);
    } else {
      setForm({
        name: "",
        email: "",
        gender: "male",
        phone: "",
      });
    }
    setErrors({});
    setApiError(null);
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setApiError(null);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});
      setApiError(null);

      const validation = validateUserForm(form);
      if (!validation.success) {
        const formErrors: FormErrors = {};
        validation.errors.forEach((err) => {
          formErrors[err.field] = t(
            `user.modal.validation.${err.field}.${err.message}`
          );
        });
        setErrors(formErrors);
        return;
      }

      if (initialData?.id) {
        await dispatch(
          editUser({
            id: initialData.id,
            data: validation.data as Omit<User, "id">,
          })
        ).unwrap();
        toast.success(t("user.updateSuccess"));
      } else {
        await dispatch(
          createUser(validation.data as Omit<User, "id">)
        ).unwrap();
        toast.success(t("user.createSuccess"));
      }

      onClose();
    } catch (error: any) {
      console.error("Form submission error:", error);
        setApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {initialData
              ? t("user.modal.title.edit")
              : t("user.modal.title.create")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
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
          </button>
        </div>

        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("user.modal.form.name.label")}
            </label>
            <input
              name="name"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4f772d] focus:border-[#4f772d] ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("user.modal.form.name.placeholder")}
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("user.modal.form.email.label")}
            </label>
            <input
              name="email"
              type="email"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4f772d] focus:border-[#4f772d] ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("user.modal.form.email.placeholder")}
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("user.modal.form.phone.label")}
            </label>
            <input
              name="phone"
              type="tel"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4f772d] focus:border-[#4f772d] ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("user.modal.form.phone.placeholder")}
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("user.modal.form.gender.label")}
            </label>
            <select
              name="gender"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4f772d] focus:border-[#4f772d] ${
                errors.gender ? "border-red-500" : "border-gray-300"
              }`}
              value={form.gender}
              onChange={handleChange}
            >
              <option value="male">
                {t("user.modal.form.gender.options.male")}
              </option>
              <option value="female">
                {t("user.modal.form.gender.options.female")}
              </option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between space-x-2 mt-6">
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-md p-2"
          >
            {t("user.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#4f772d] text-white hover:bg-[#132a13] disabled:opacity-50 border-0 rounded-md p-2 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
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
                {t(
                  initialData
                    ? "user.button.loading.edit"
                    : "user.button.loading.create"
                )}
              </>
            ) : (
              <>
                {initialData ? (
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
                ) : (
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
                )}
                {t(initialData ? "user.button.edit" : "user.button.create")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
