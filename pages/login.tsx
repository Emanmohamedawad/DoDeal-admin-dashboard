import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import { useState } from "react";
import { login } from "../store/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation("common");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = (): void => {
    if (email === "admin@example.com" && password === "admin123") {
      const token = "FAKE_TOKEN";
      dispatch(login(token));
      document.cookie = `token=${token}; path=/`;
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffffff]">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#132a13]">
            {t("login")}
          </h2>
        </div>
        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t("email")}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#4f772d]/20 placeholder-[#132a13]/60 text-[#132a13] rounded-t-md focus:outline-none focus:ring-[#4f772d] focus:border-[#4f772d] focus:z-10 sm:text-sm"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#4f772d]/20 placeholder-[#132a13]/60 text-[#132a13] rounded-b-md focus:outline-none focus:ring-[#4f772d] focus:border-[#4f772d] focus:z-10 sm:text-sm"
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4f772d] hover:bg-[#132a13] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f772d]"
            >
              {t("login")}
            </button>
          </div>
        </form>
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
