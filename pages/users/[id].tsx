import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import axios from "axios";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

export default function UserDetail() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { id } = router.query;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios
        .get(`https://mini-admin-portal.vercel.app/api/users/${id}`)
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 md:ml-64">
        <Header onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6 bg-white min-h-screen">
          <h2 className="text-2xl font-bold mb-4">{t("users")}</h2>
          {loading ? (
            <p>{t("dashboard.table.loading")}</p>
          ) : user ? (
            <div className="space-y-2">
              <p>
                <strong>{t("dashboard.table.id")}:</strong> {user.id}
              </p>
              <p>
                <strong>{t("name")}:</strong> {user.name}
              </p>
              <p>
                <strong>{t("email")}:</strong> {user.email}
              </p>
              <p>
                <strong>{t("phone")}:</strong> {user.phone}
              </p>
              <p>
                <strong>{t("gender")}:</strong> {user.gender}
              </p>
            </div>
          ) : (
            <p>{t("dashboard.table.error", { error: "User not found" })}</p>
          )}
        </main>
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
