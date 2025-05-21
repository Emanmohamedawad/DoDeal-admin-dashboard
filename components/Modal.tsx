import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import Button from "./Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: any) => void;
  initialData?: any;
}

export default function Modal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const { t } = useTranslation("common");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "male",
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (form.name && form.email) {
      onSubmit(form);
      onClose();
    } else {
      alert(t("user.modal.validation.required"));
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
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4f772d] focus:border-[#4f772d]"
              placeholder={t("user.modal.form.name.placeholder")}
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("user.modal.form.email.label")}
            </label>
            <input
              name="email"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4f772d] focus:border-[#4f772d]"
              placeholder={t("user.modal.form.email.placeholder")}
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("user.modal.form.phone.label")}
            </label>
            <input
              name="phone"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4f772d] focus:border-[#4f772d]"
              placeholder={t("user.modal.form.phone.placeholder")}
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("user.modal.form.gender.label")}
            </label>
            <select
              name="gender"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4f772d] focus:border-[#4f772d]"
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
          </div>
        </div>

        <div className="flex justify-between space-x-2 mt-6">
          <Button onClick={onClose}>{t("user.cancel")}</Button>
          <Button onClick={handleSubmit}>{t("user.submit")}</Button>
        </div>
      </div>
    </div>
  );
}
