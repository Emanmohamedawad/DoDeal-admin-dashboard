import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axios";
import Button from "./Button";
import { UserFormData, validateUserForm } from "../utils/validation";
import type { AppDispatch } from "../store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: UserFormData) => void;
  initialData?: UserFormData & { id?: number };
}

interface FormErrors {
  [key: string]: string;
}

export default function Modal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const { t } = useTranslation("common");
  const [form, setForm] = useState<UserFormData>({
    name: "",
    email: "",
    gender: "male",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        email: initialData.email,
        gender: initialData.gender || "male",
        phone: initialData.phone || "",
      });
    } else {
      // Reset form when opening for new user
      setForm({
        name: "",
        email: "",
        gender: "male",
        phone: "",
      });
    }
    // Reset errors when modal opens/closes
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({}); // Clear any previous errors

      // Validate form
      const validation = validateUserForm(form);
      if (!validation.success) {
        const formErrors: FormErrors = {};
        validation.errors.forEach((err) => {
          formErrors[err.field] = err.message;
        });
        setErrors(formErrors);
        return;
      }

      // If email check passes (or if editing), proceed with form submission
      let response;
      if (initialData?.id) {
        response = await axiosInstance.put(
          `/api/proxy/users/${initialData.id}`,
          validation.data
        );
      } else {
        response = await axiosInstance.post(
          "/api/proxy/users",
          validation.data
        );
      }

      // If we get here, the request was successful
      if (response.status === 200 || response.status === 201) {
        // Show success message
        toast.success(
          initialData ? t("user.updateSuccess") : t("user.createSuccess")
        );

        // Call onSubmit with the validated data
        onSubmit(validation.data);
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      setErrors({ submit: error.response?.data?.error || error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData
            ? t("user.modal.title.edit")
            : t("user.modal.title.create")}
        </h2>

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
            className="bg-[#4f772d] text-white hover:bg-[#132a13] disabled:opacity-50 border-0 rounded-md p-2"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              </span>
            ) : (
              t(initialData ? "user.button.edit" : "user.button.create")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
