export default function UpdateInputButton({ onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`absolute right-0 top-1/2 h-full transform -translate-y-1/2 px-2 py-2 rounded-full text-sm font-semibold hover:opacity-70 ${className}`}
    >Update</button>
  );
}
