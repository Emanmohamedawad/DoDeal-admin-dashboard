import Link from 'next/link';

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <aside className={`bg-dark text-white w-64 h-screen p-4 fixed top-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out md:translate-x-0`}>
      <h2 className="text-xl font-bold mb-6">Admin</h2>
      <nav className="flex flex-col space-y-4">
        <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
      </nav>
    </aside>
  );
}
