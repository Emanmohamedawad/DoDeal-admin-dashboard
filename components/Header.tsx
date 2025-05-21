export default function Header({ onToggle }: { onToggle: () => void }) {
    return (
      <header className="bg-primary text-white p-4 flex justify-between items-center md:ml-64">
        <button className="md:hidden" onClick={onToggle}>☰</button>
        <h1 className="text-lg font-semibold">Mini Admin</h1>
      </header>
    );
  }
  