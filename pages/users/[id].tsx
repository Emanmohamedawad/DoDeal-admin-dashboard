import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import axiosInstance from "../../utils/axios";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  gender?: string;
  phone?: string;
}

interface UserDetailsState {
  user: User | null;
  loading: boolean;
  error: string | null;
  sidebarOpen: boolean;
}

interface UserField {
  key: keyof User;
  label: string;
}

// Constants
const USER_FIELDS: UserField[] = [
  { key: "id", label: "user.id" },
  { key: "name", label: "user.name" },
  { key: "email", label: "user.email" },
  { key: "phone", label: "user.phone" },
  { key: "gender", label: "user.gender" },
];

// Custom hooks
const useUserDetails = (userId: string | string[] | undefined) => {
  const { t } = useTranslation("common");
  const [state, setState] = useState<UserDetailsState>({
    user: null,
    loading: true,
    error: null,
    sidebarOpen: false,
  });

  const updateState = useCallback((updates: Partial<UserDetailsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;

    try {
      updateState({ loading: true, error: null });
      const response = await axiosInstance.get<User>(`/api/users/${userId}`);
      updateState({ user: response.data, loading: false });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, t);
      updateState({ error: errorMessage, loading: false });
    }
  }, [userId, updateState, t]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return { state, updateState };
};

const useAuthCheck = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);
};

// Helper functions
const getErrorMessage = (error: any, t: (key: string) => string): string => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        return t("error.unauthorized");
      case 404:
        return t("error.userNotFound");
      default:
        return error.response.data?.error || t("error.generic");
    }
  }
  if (error.request) {
    return t("error.network");
  }
  return t("error.generic");
};

const formatFieldValue = (value: any): string => {
  if (value === null) return "null";
  if (!value) return "_";
  return value;
};

// Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f772d]"></div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
    {message}
  </div>
);

const UserDetails = ({ user }: { user: User }) => {
  const { t } = useTranslation("common");

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {USER_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-500 min-w-[80px]">
              {t(label)}:
            </p>
            <p className="text-lg text-gray-900">
              {formatFieldValue(user[key])}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const BackButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation("common");

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm font-medium text-[#4f772d] hover:text-[#132a13] bg-transparent hover:bg-[#4f772d]/10 rounded-md"
    >
      {t("dashboard.pagination.previous")}
    </button>
  );
};

// Main component
export default function UserDetail() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { id } = router.query;
  const { state, updateState } = useUserDetails(id);
  useAuthCheck();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar isOpen={state.sidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Header
            onToggle={() => updateState({ sidebarOpen: !state.sidebarOpen })}
          />
          <main className="flex-1 p-6 bg-white">
            <div className="max-w-4xl mx-auto h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {t("user.usersdetails")}
                </h2>
                <BackButton onClick={() => router.back()} />
              </div>

              {state.loading ? (
                <LoadingSpinner />
              ) : state.error ? (
                <ErrorMessage message={state.error} />
              ) : state.user ? (
                <UserDetails user={state.user} />
              ) : (
                <ErrorMessage message={t("error.userNotFound")} />
              )}
            </div>
          </main>
        </div>
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

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};
