import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r min-h-screen p-6">
      <h1 className="text-xl font-semibold mb-10">
        Factory System
      </h1>

      <nav className="space-y-4">
        <Link
          to="/owner/dashboard"
          className="block text-gray-700 hover:text-black"
        >
          Dashboard
        </Link>

        <Link
          to="/owner/clients"
          className="block text-gray-700 hover:text-black"
        >
          Clients
        </Link>
      </nav>
    </div>
  );
}
