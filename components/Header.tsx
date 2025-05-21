import { useEffect, useState } from "react";

interface HeaderProps {
  onToggle: () => void;
}

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
        {/* Mobile menu button */}
        <button
          type="button"
          className="text-[#132a13] hover:text-[#4f772d] lg:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4f772d]"
          onClick={onToggle}
        >
          <span className="sr-only">Open sidebar</span>
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
        </button>

        {/* Search */}
        <div className="flex-1 px-4 lg:px-0">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-[#132a13]/60"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-[#4f772d]/20 rounded-md leading-5 bg-white placeholder-[#132a13]/60 focus:outline-none focus:placeholder-[#132a13] focus:ring-1 focus:ring-[#4f772d] focus:border-[#4f772d] sm:text-sm"
                placeholder="Search"
                type="search"
              />
            </div>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center">
          {/* Notifications */}
          <button
            type="button"
            className="p-1 text-[#132a13]/60 hover:text-[#4f772d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f772d]"
          >
            <span className="sr-only">View notifications</span>
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
          </button>

          {/* Profile dropdown */}
          <div className="ml-3 relative">
            <button
              type="button"
              className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f772d]"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-[#4f772d] flex items-center justify-center text-white">
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
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
