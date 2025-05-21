export default function Button({ children, ...props }) {
  return (
    <button
      className="bg-[#4f772d] text-white px-4 py-2 rounded hover:bg-[#132a13] transition-colors duration-300"
      {...props}
    >
      {children}
    </button>
  );
}
