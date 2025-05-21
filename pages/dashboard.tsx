import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { AppDispatch, RootState } from "../store";
import { fetchUsers, createUser, editUser } from "../store/userSlice";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Modal from "../components/Modal";
import Button from "../components/Button";
import type { User } from "../store/userSlice";
import type { GetStaticProps } from "next";
import { useRouter } from "next/router";

const ITEMS_PER_PAGE = 3;

export default function Dashboard() {
  const { t } = useTranslation("common");
  const dispatch: AppDispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.list);
  const loading = useSelector((state: RootState) => state.users.loading);
  const error = useSelector((state: RootState) => state.users.error);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditData(user);
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    router.push("/create-user");
  };

  const handleEditSubmit = async (form: Omit<User, "id">) => {
    try {
      if (!editData) return;

      // Edit the user
      await dispatch(editUser({ id: editData.id, data: form })).unwrap();

      // Close modal and reset edit data
      setModalOpen(false);
      setEditData(null);

      // Reset to first page
      setCurrentPage(1);

      // Refresh the user list
      await dispatch(fetchUsers()).unwrap();
    } catch (error: any) {
      // Error is already handled in the Modal component
      console.error("Error in dashboard:", error);
    }
  };

  const handleViewUser = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  // Filter users based on search term (name only) and sort by ID
  const filteredAndSortedUsers = users
    .filter((user: User) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: User, b: User) => a.id - b.id);

  // Calculate pagination using the sorted and filtered users
  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredAndSortedUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {t("dashboard.title")}
              </h2>
              <Button
                onClick={handleCreateClick}
                className="bg-[#4f772d] text-white hover:bg-[#132a13] border-0 rounded-md px-4 py-2"
              >
                {t("user.create")}
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("dashboard.search.placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-sm border border-[#4f772d]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f772d] focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-[#4f772d]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f772d]"></div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-64 text-red-600">
                  {t("dashboard.table.error", { error })}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#4f772d]/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#132a13] uppercase tracking-wider">
                            {t("dashboard.table.id")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#132a13] uppercase tracking-wider">
                            {t("dashboard.table.name")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#132a13] uppercase tracking-wider">
                            {t("dashboard.table.email")}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-[#132a13] uppercase tracking-wider">
                            {t("dashboard.table.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedUsers.map((user: User) => (
                          <tr key={user.id} className="hover:bg-[#4f772d]/5">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-[#132a13]">
                                {user.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-[#132a13]">
                                {user.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-[#132a13]/80">
                                {user.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleViewUser(user.id)}
                                  className="text-[#4f772d] hover:text-[#132a13] bg-transparent hover:bg-[#4f772d]/10 p-1 rounded-md"
                                  title={t("dashboard.table.view")}
                                >
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
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                                <Button
                                  onClick={() => handleOpenEdit(user)}
                                  className="text-[#4f772d] hover:text-[#132a13] bg-transparent hover:bg-[#4f772d]/10 px-3 py-1 rounded-md"
                                >
                                  {t("dashboard.table.edit")}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-[#4f772d]/10 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <Button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-[#4f772d]/20 text-sm font-medium rounded-md text-[#132a13] bg-white hover:bg-[#4f772d]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("dashboard.pagination.previous")}
                      </Button>
                      <Button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#4f772d]/20 text-sm font-medium rounded-md text-[#132a13] bg-white hover:bg-[#4f772d]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("dashboard.pagination.next")}
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-[#132a13]">
                          {t("dashboard.pagination.showing")}{" "}
                          <span className="font-medium">
                            {filteredAndSortedUsers.length > 0
                              ? startIndex + 1
                              : 0}
                          </span>{" "}
                          {t("dashboard.pagination.to")}{" "}
                          <span className="font-medium">
                            {Math.min(
                              startIndex + ITEMS_PER_PAGE,
                              filteredAndSortedUsers.length
                            )}
                          </span>{" "}
                          {t("dashboard.pagination.of")}{" "}
                          <span className="font-medium">
                            {filteredAndSortedUsers.length}
                          </span>{" "}
                          {t("dashboard.pagination.users")}
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <Button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={
                              currentPage === 1 ||
                              filteredAndSortedUsers.length === 0
                            }
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#4f772d]/20 bg-white text-sm font-medium text-[#132a13] hover:bg-[#4f772d]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t("dashboard.pagination.previous")}
                          </Button>
                          {[...Array(Math.max(1, totalPages))].map(
                            (_, index) => (
                              <Button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                disabled={filteredAndSortedUsers.length === 0}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === index + 1
                                    ? "z-10 bg-[#4f772d] border-[#4f772d] text-white"
                                    : "bg-white border-[#4f772d]/20 text-[#132a13] hover:bg-[#4f772d]/5"
                                } ${
                                  filteredAndSortedUsers.length === 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                {index + 1}
                              </Button>
                            )
                          )}
                          <Button
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
                            disabled={
                              currentPage === totalPages ||
                              filteredAndSortedUsers.length === 0
                            }
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#4f772d]/20 bg-white text-sm font-medium text-[#132a13] hover:bg-[#4f772d]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t("dashboard.pagination.next")}
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditData(null);
          }}
          onSubmit={handleEditSubmit}
          initialData={editData}
        />
      )}
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
