import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

// Types
interface HeaderProps {
  onToggle: () => void;
}

interface LanguageOption {
  code: string;
  label: string;
}

// Constants
const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "header.language.en" },
  { code: "ar", label: "header.language.ar" },
];

// Custom hooks
const useLanguageMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".language-menu")) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  return { isOpen, toggle, close };
};

// Components
const MobileMenuButton = ({ onToggle }: { onToggle: () => void }) => (
  <button
    type="button"
    className="text-[#132a13] hover:text-[#4f772d] lg:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4f772d]"
    onClick={onToggle}
  >
    <span className="sr-only">Open sidebar</span>
    <MenuIcon />
  </button>
);

const ProfileButton = () => {
  const { t } = useTranslation("common");
  return (
    <button
      type="button"
      className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f772d]"
    >
      <span className="sr-only">{t("header.profile.label")}</span>
      <div className="h-8 w-8 rounded-full bg-[#4f772d] flex items-center justify-center text-white">
        <UserIcon />
      </div>
    </button>
  );
};

const LanguageSwitcher = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const { isOpen, toggle, close } = useLanguageMenu();

  const handleLanguageChange = useCallback(
    (newLocale: string) => {
      const { pathname, asPath, query } = router;
      router.push({ pathname, query }, asPath, { locale: newLocale });
      close();
    },
    [router, close]
  );

  return (
    <div className="relative language-menu">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center text-sm font-medium text-[#132a13] hover:text-[#4f772d]"
      >
        <span className="sr-only">{t("header.language.label")}</span>
        <span className="uppercase">{locale}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            locale === "ar" ? "left-0" : "right-0"
          } mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}
        >
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-menu"
          >
            {LANGUAGE_OPTIONS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`${
                  locale === code
                    ? "bg-[#4f772d]/10 text-[#4f772d]"
                    : "text-[#132a13] hover:bg-[#4f772d]/5"
                } block w-full text-left px-4 py-2 text-sm`}
                role="menuitem"
              >
                {t(label)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationButton = () => {
  const { t } = useTranslation("common");
  return (
    <button
      type="button"
      className="p-1 text-[#132a13]/60 hover:text-[#4f772d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f772d]"
    >
      <span className="sr-only">{t("header.notifications.label")}</span>
      <NotificationIcon />
    </button>
  );
};

// Icons
const MenuIcon = () => (
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
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const UserIcon = () => (
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
);

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`ml-2 h-5 w-5 transition-transform duration-200 ${
      isOpen ? "transform rotate-180" : ""
    }`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const NotificationIcon = () => (
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
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

// Main component
export default function Header({ onToggle }: HeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleToggleSidebar = () => onToggle();
    document.addEventListener("toggleSidebar", handleToggleSidebar);
    return () =>
      document.removeEventListener("toggleSidebar", handleToggleSidebar);
  }, [onToggle]);

  if (!mounted) return null;

  return (
    <header className="bg-white shadow-sm border-b border-[#4f772d]/10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <MobileMenuButton onToggle={onToggle} />

        <div className="flex-1 px-4 lg:px-0">
          <div className="relative">
            <ProfileButton />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <NotificationButton />
        </div>
      </div>
    </header>
  );
}
