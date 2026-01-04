import { useState } from "react";
import OwnerLayout from "../../layouts/OwnerLayout";
import { useNavigate } from "react-router-dom";

export default function CreateStaff() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Staff created (dummy)");
    navigate("/owner/staff");
  };

  return (
    <OwnerLayout>
      <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Create Staff</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Staff Email"
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Initial Password"
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            Create Staff
          </button>
        </form>
      </div>
    </OwnerLayout>
  );
}
