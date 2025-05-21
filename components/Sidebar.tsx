import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import Logo from "../assets/images/dodeal-white.png";
import { logout } from "../store/authSlice";

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  translationKey: string;
  path: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

const navigation: NavItem[] = [
  {
    translationKey: "dashboard",
    path: "/dashboard",
    icon: (props) => (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("common");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    // Clear any stored tokens
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("token");

    // Dispatch logout action
    dispatch(logout());

    // Redirect to login page
    router.push("/login");
  };

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-[#132a13] bg-opacity-50 lg:hidden"
          onClick={() =>
            document.dispatchEvent(new CustomEvent("toggleSidebar"))
          }
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 py-2 bg-[#4f772d]">
          <Image src={Logo} alt="Logo" width={80} height={100} />
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 flex-grow">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = router.pathname === item.path;
              return (
                <Link
                  key={item.translationKey}
                  href={item.path}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-[#4f772d]/10 text-[#4f772d]"
                      : "text-[#132a13] hover:bg-[#4f772d]/5 hover:text-[#4f772d]"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? "text-[#4f772d]" : "text-[#132a13]/60"
                    }`}
                  />
                  {t(`sidebar.${item.translationKey}`)}
                </Link>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-[#132a13] hover:bg-red-50 hover:text-red-600 mt-4"
            >
              <svg
                className="mr-3 h-5 w-5 text-[#132a13]/60"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {t("sidebar.logout")}
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="w-full p-4 border-t border-[#4f772d]/10 mt-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#4f772d] flex items-center justify-center text-white">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#132a13]">
                {t("sidebar.userProfile.admin")}
              </p>
              <p className="text-xs font-medium text-[#132a13]/60">
                {t("sidebar.userProfile.email")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
