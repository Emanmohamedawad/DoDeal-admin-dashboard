import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import axiosInstance from "../../utils/axios";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

interface User {
  id: number;
  name: string;
  email: string;
  gender?: string;
  phone?: string;
}

export default function UserDetail() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { id } = router.query;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Use our proxy endpoint instead of calling the external API directly
        const response = await axiosInstance.get<User>(`/api/users/${id}`);
        setUser(response.data);
      } catch (err: any) {
        if (err.response) {
          switch (err.response.status) {
            case 401:
              setError(t("error.unauthorized"));
              break;
            case 404:
              setError(t("error.userNotFound"));
              break;
            default:
              setError(err.response.data?.error || t("error.generic"));
          }
        } else if (err.request) {
          setError(t("error.network"));
        } else {
          setError(t("error.generic"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id, t]);

  // Redirect to login if no token is present
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Header onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-6 bg-white">
            <div className="max-w-4xl mx-auto h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {t("user.usersdetails")}
                </h2>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 text-sm font-medium text-[#4f772d] hover:text-[#132a13] bg-transparent hover:bg-[#4f772d]/10 rounded-md"
                >
                  {t("dashboard.pagination.previous")}
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f772d]"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              ) : user ? (
                <div className="bg-white shadow rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-500 min-w-[80px]">
                        {t("user.id")}:
                      </p>
                      <p className="text-lg text-gray-900">{user.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-500 min-w-[80px]">
                        {t("user.name")}:
                      </p>
                      <p className="text-lg text-gray-900">
                        {user.name === null ? "null" : user.name || "_"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-500 min-w-[80px]">
                        {t("user.email")}:
                      </p>
                      <p className="text-lg text-gray-900">
                        {user.email === null ? "null" : user.email || "_"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-500 min-w-[80px]">
                        {t("user.phone")}:
                      </p>
                      <p className="text-lg text-gray-900">
                        {user.phone === null ? "null" : user.phone || "_"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-500 min-w-[80px]">
                        {t("user.gender")}:
                      </p>
                      <p className="text-lg text-gray-900">
                        {user.gender === null ? "null" : user.gender || "_"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded-md">
                  {t("error.userNotFound")}
                </div>
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
