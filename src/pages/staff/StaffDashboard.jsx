import StaffLayout from "../../layouts/StaffLayout";

export default function Dashboard() {
  const cards = [
    { title: "Clients", value: "3" },
    { title: "Active Orders", value: "56" },
    { title: "Staff Members", value: "12" },
  ];

  return (
    <StaffLayout>
      <div className="min-h-screen pb-10">
        {/* Premium gradient background */}
        <div className="bg-gradient-to-r from-indigo-50 via-white to-pink-50 rounded-3xl p-8 mb-8 shadow-inner">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
           Staff Dashboard
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white via-gray-50 to-white shadow-lg hover:shadow-2xl transition-shadow rounded-3xl p-6 flex flex-col"
              >
                <p className="text-gray-400 font-medium">{card.title}</p>
                <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-gray-800">
                  {card.value}
                </h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
