export default function Button({ children, ...props }) {
    return (
      <button
        className="bg-primary text-white px-4 py-2 rounded hover:bg-green-700"
        {...props}
      >
        {children}
      </button>
    );
  }
  