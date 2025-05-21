import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axios";
import Button from "../components/Button";
import { UserFormData, validateUserForm } from "../utils/validation";
import { createUser, fetchUsers } from "../store/userSlice";
import type { AppDispatch } from "../store";
import type { User } from "../store/userSlice";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import type { GetStaticProps } from "next";

interface FormErrors {
  [key: string]: string;
}

export default function CreateUser() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [form, setForm] = useState<UserFormData>({
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrors({}); // Clear any previous errors

      // Validate form
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

      // Create the user directly
      await dispatch(createUser(validation.data as Omit<User, "id">)).unwrap();

      // Show success message
      toast.success(t("user.createSuccess"));

      // Refresh the user list
      await dispatch(fetchUsers()).unwrap();

      // Redirect back to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Form submission error:", error.response?.data || error);

      if (error.response?.data?.details) {
        const formErrors: FormErrors = {};
        error.response.data.details.forEach((err: any) => {
          formErrors[err.field] = err.message;
        });
        setErrors(formErrors);
      } else if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        setErrors({ submit: t("error.connection.refused") });
      } else if (error.response?.status === 500) {
        setErrors({
          submit:
            error.response.data?.error || t("error.connection.serverError"),
        });
      } else if (!error.response) {
        setErrors({ submit: t("error.connection.noResponse") });
      } else {
        setErrors({
          submit: error.message || t("error.connection.unexpected"),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Header onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("user.modal.title.create")}
                </h1>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-md px-4 py-2"
                >
                  {t("user.back")}
                </Button>
              </div>

              {/* Show general submission error if any */}
              {errors.submit && (
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
                      <p className="text-sm font-medium text-red-800">
                        {errors.submit}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4f772d] hover:bg-[#456528] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f772d]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t("user.modal.form.submit.loading")
                      : t("user.modal.form.submit.label")}
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});
