import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import { login } from "../store/authSlice";

// Types
interface LoginForm {
  email: string;
  password: string;
}

interface LoginState {
  form: LoginForm;
  error: string;
}

// Constants
const AUTH_TOKEN =
  "Bearer eyJ0eXAiOiAiSldUIiwgInR5cGUiOiAiQmVhcmVyIiwgInZhbCI6ICIxMjM0NS1hYmNkLWVmZ2gtMTIzNC01Njc4OTAifQ==";
const VALID_CREDENTIALS = {
  email: "admin@example.com",
  password: "admin123",
};

// Custom hooks
const useLoginForm = () => {
  const [state, setState] = useState<LoginState>({
    form: { email: "", password: "" },
    error: "",
  });

  const updateForm = useCallback((field: keyof LoginForm, value: string) => {
    setState((prev) => ({
      ...prev,
      form: { ...prev.form, [field]: value },
      error: "", // Clear error when form is updated
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return { state, updateForm, setError };
};

const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation("common");

  const handleLogin = useCallback(
    async (credentials: LoginForm) => {
      if (
        credentials.email === VALID_CREDENTIALS.email &&
        credentials.password === VALID_CREDENTIALS.password
      ) {
        // Store auth token
        dispatch(login(AUTH_TOKEN));
        localStorage.setItem("authToken", AUTH_TOKEN);
        document.cookie = `token=${AUTH_TOKEN}; path=/`;

        // Redirect to dashboard
        await router.push("/dashboard");
        return true;
      }
      return false;
    },
    [dispatch, router]
  );

  return { handleLogin };
};

// Components
const LoginForm = ({
  form,
  error,
  onUpdate,
  onSubmit,
}: {
  form: LoginForm;
  error: string;
  onUpdate: (field: keyof LoginForm, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) => {
  const { t } = useTranslation("common");

  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        <FormField
          id="email-address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("email")}
          value={form.email}
          onChange={(e) => onUpdate("email", e.target.value)}
          required
          className="rounded-t-md"
        />
        <FormField
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={t("password")}
          value={form.password}
          onChange={(e) => onUpdate("password", e.target.value)}
          required
          className="rounded-b-md"
        />
      </div>

      {error && <ErrorMessage message={error} />}

      <SubmitButton />
    </form>
  );
};

const FormField = ({
  id,
  name,
  type,
  autoComplete,
  placeholder,
  value,
  onChange,
  required,
  className,
}: {
  id: string;
  name: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
}) => {
  const { t } = useTranslation("common");

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {t(name)}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className={`appearance-none relative block w-full px-3 py-2 border border-[#4f772d]/20 placeholder-[#132a13]/60 text-[#132a13] focus:outline-none focus:ring-[#4f772d] focus:border-[#4f772d] focus:z-10 sm:text-sm ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="text-red-600 text-sm text-center">{message}</div>
);

const SubmitButton = () => {
  const { t } = useTranslation("common");

  return (
    <button
      type="submit"
      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4f772d] hover:bg-[#132a13] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f772d]"
    >
      {t("login")}
    </button>
  );
};

// Main component
export default function LoginPage() {
  const { t } = useTranslation("common");
  const { state, updateForm, setError } = useLoginForm();
  const { handleLogin } = useAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await handleLogin(state.form);
      if (!success) {
        setError(t("login.error.invalid"));
      }
    },
    [state.form, handleLogin, setError, t]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffffff]">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#132a13]">
            {t("login")}
          </h2>
        </div>
        <LoginForm
          form={state.form}
          error={state.error}
          onUpdate={updateForm}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
