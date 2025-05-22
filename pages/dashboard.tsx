import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { AppDispatch, RootState } from "../store";
import { fetchUsers, createUser, editUser } from "../store/userSlice";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Modal from "../components/Modal";
import Button from "../components/Button";
import type { User } from "../store/userSlice";
import type { GetStaticProps } from "next";
import { useRouter } from "next/router";

// Types
interface DashboardState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  editData: User | null;
  currentPage: number;
  searchTerm: string;
}

interface TableColumn {
  key: keyof User | "actions";
  label: string;
  render?: (user: User) => React.ReactNode;
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  columns: TableColumn[];
  onEditUserClick: (user: User) => void;
  onViewUserClick: (userId: number) => void;
}

interface TableBodyProps {
  users: User[];
  columns: TableColumn[];
  onEditUserClick: (user: User) => void;
  onViewUserClick: (userId: number) => void;
}

interface UserActionsProps {
  user: User;
  onEditUserClick: (user: User) => void;
  onViewUserClick: (userId: number) => void;
}

// Constants
const ITEMS_PER_PAGE = 3;

const TABLE_COLUMNS: TableColumn[] = [
  { key: "id", label: "dashboard.table.id" },
  { key: "name", label: "dashboard.table.name" },
  { key: "email", label: "dashboard.table.email" },
  { key: "phone", label: "dashboard.table.phone" },
  { key: "gender", label: "dashboard.table.gender" },
  {
    key: "actions",
    label: "dashboard.table.actions",
  },
];

// Custom hooks
const useDashboardState = () => {
  const [state, setState] = useState<DashboardState>({
    sidebarOpen: false,
    modalOpen: false,
    editData: null,
    currentPage: 1,
    searchTerm: "",
  });

  const updateState = useCallback((updates: Partial<DashboardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  return { state, updateState };
};

const useUserManagement = () => {
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation("common");
  const router = useRouter();

  const handleCreateUser = useCallback(
    async (form: Omit<User, "id">) => {
      try {
        await dispatch(createUser(form)).unwrap();
        toast.success(t("user.createSuccess"));
        await dispatch(fetchUsers()).unwrap();
        return true;
      } catch (error: any) {
        console.error("Error in create user:", error);
        return false;
      }
    },
    [dispatch, t]
  );

  const handleEditUser = useCallback(
    async (form: Omit<User, "id">, userId: number) => {
      try {
        await dispatch(editUser({ id: userId, data: form })).unwrap();
        toast.success(t("user.updateSuccess"));
        await dispatch(fetchUsers()).unwrap();
        return true;
      } catch (error: any) {
        console.error("Error in edit user:", error);
        return false;
      }
    },
    [dispatch, t]
  );

  const handleViewUser = useCallback(
    (userId: number) => {
      router.push(`/users/${userId}`);
    },
    [router]
  );

  return {
    handleCreateUser,
    handleEditUser,
    handleViewUser,
  };
};

// Components
const SearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation("common");

  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder={t("dashboard.search.placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 pl-10 text-sm border border-[#4f772d]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f772d] focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
      </div>
    </div>
  );
};

const UserTable = ({
  users,
  loading,
  columns,
  onEditUserClick,
  onViewUserClick,
}: UserTableProps) => {
  const { t } = useTranslation("common");

  if (loading) {
    return <LoadingSpinner />;
  }

  if (users.length === 0) {
    return <EmptyState message={t("dashboard.table.noUsers")} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader columns={columns} />
        <TableBody
          users={users}
          columns={columns}
          onEditUserClick={onEditUserClick}
          onViewUserClick={onViewUserClick}
        />
      </table>
    </div>
  );
};

const TableHeader = ({ columns }: { columns: TableColumn[] }) => {
  const { t } = useTranslation("common");

  return (
    <thead className="bg-[#4f772d]/5">
      <tr>
        {columns.map(({ key, label }) => (
          <th
            key={key}
            className="px-6 py-3 text-left text-xs font-medium text-[#132a13] uppercase tracking-wider"
          >
            {t(label)}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const TableBody = ({
  users,
  columns,
  onEditUserClick,
  onViewUserClick,
}: TableBodyProps) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {users.map((user) => (
      <tr key={user.id} className="hover:bg-[#4f772d]/5">
        {columns.map(({ key }) => (
          <td key={key} className="px-6 py-4 whitespace-nowrap">
            {key === "actions" ? (
              <UserActions
                user={user}
                onEditUserClick={onEditUserClick}
                onViewUserClick={onViewUserClick}
              />
            ) : (
              <div className="text-sm text-[#132a13]/80">
                {user[key as keyof User] ?? "_"}
              </div>
            )}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

const UserActions = ({
  user,
  onEditUserClick,
  onViewUserClick,
}: UserActionsProps) => {
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-end space-x-2">
      <button
        onClick={() => onViewUserClick(user.id)}
        className="text-[#4f772d] hover:text-[#132a13] bg-transparent hover:bg-[#4f772d]/10 p-1 rounded-md"
        title={t("dashboard.table.view")}
      >
        <ViewIcon />
      </button>
      <Button
        onClick={() => onEditUserClick(user)}
        className="text-[#4f772d] hover:text-[#132a13] bg-transparent hover:bg-[#4f772d]/10 px-3 py-1 rounded-md"
      >
        {t("dashboard.table.edit")}
      </Button>
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
}) => {
  const { t } = useTranslation("common");
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-[#4f772d]/10 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#132a13]">
            {t("dashboard.pagination.showing")}{" "}
            <span className="font-medium">{startIndex + 1}</span>{" "}
            {t("dashboard.pagination.to")}{" "}
            <span className="font-medium">{endIndex}</span>{" "}
            {t("dashboard.pagination.of")}{" "}
            <span className="font-medium">{totalItems}</span>{" "}
            {t("dashboard.pagination.users")}
          </p>
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
}) => {
  const { t } = useTranslation("common");

  return (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
      <Button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1 || totalItems === 0}
        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#4f772d]/20 bg-white text-sm font-medium text-[#132a13] hover:bg-[#4f772d]/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("dashboard.pagination.previous")}
      </Button>
      {[...Array(Math.max(1, totalPages))].map((_, index) => (
        <Button
          key={index + 1}
          onClick={() => onPageChange(index + 1)}
          disabled={totalItems === 0}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            currentPage === index + 1
              ? "z-10 bg-[#4f772d] border-[#4f772d] text-white"
              : "bg-white border-[#4f772d]/20 text-[#132a13] hover:bg-[#4f772d]/5"
          } ${totalItems === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {index + 1}
        </Button>
      ))}
      <Button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages || totalItems === 0}
        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#4f772d]/20 bg-white text-sm font-medium text-[#132a13] hover:bg-[#4f772d]/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("dashboard.pagination.next")}
      </Button>
    </nav>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f772d]"></div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center h-64 text-gray-600">
    {message}
  </div>
);

// Icons
const SearchIcon = () => (
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
);

const ViewIcon = () => (
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
);

// Main component
export default function Dashboard() {
  const { t } = useTranslation("common");
  const dispatch: AppDispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.list);
  const loading = useSelector((state: RootState) => state.users.loading);
  const { state, updateState } = useDashboardState();
  const { handleCreateUser, handleEditUser, handleViewUser } =
    useUserManagement();

  // console.log("Modal Open State:", state.modalOpen);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleModalClose = async () => {
    updateState({ modalOpen: false, editData: null });
    await dispatch(fetchUsers()).unwrap();
  };

  const handleModalSubmit = async (form: Omit<User, "id">) => {
    const success = state.editData
      ? await handleEditUser(form, state.editData.id)
      : await handleCreateUser(form);

    if (success) {
      updateState({ modalOpen: false, editData: null, currentPage: 1 });
    }
  };

  // New handler for opening the edit modal
  const handleOpenEditModal = useCallback(
    (user: User) => {
      updateState({ editData: user, modalOpen: true });
    },
    [updateState]
  );

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter((user: User) =>
      user.name.toLowerCase().includes(state.searchTerm.toLowerCase())
    )
    .sort((a: User, b: User) => a.id - b.id);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredAndSortedUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Sidebar isOpen={state.sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onToggle={() => updateState({ sidebarOpen: !state.sidebarOpen })}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {t("dashboard.title")}
              </h2>
              <Button
                onClick={() => updateState({ modalOpen: true, editData: null })}
                className="bg-[#4f772d] text-white hover:bg-[#132a13] border-0 rounded-md px-4 py-2 flex items-center gap-2"
              >
                <AddUserIcon />
                {t("dashboard.addUser")}
              </Button>
            </div>

            <SearchBar
              value={state.searchTerm}
              onChange={(value) =>
                updateState({ searchTerm: value, currentPage: 1 })
              }
            />

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <UserTable
                users={paginatedUsers}
                loading={loading}
                columns={TABLE_COLUMNS}
                onEditUserClick={handleOpenEditModal}
                onViewUserClick={handleViewUser}
              />
              <Pagination
                currentPage={state.currentPage}
                totalPages={totalPages}
                onPageChange={(page) => updateState({ currentPage: page })}
                totalItems={filteredAndSortedUsers.length}
              />
            </div>
          </div>
        </main>
      </div>
      {state.modalOpen && (
        <Modal
          isOpen={state.modalOpen}
          onClose={handleModalClose}
          initialData={state.editData}
        />
      )}
    </div>
  );
}

const AddUserIcon = () => (
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
      d="M12 4v16m8-8H4"
    />
  </svg>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
