import { useParams, useNavigate } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import { useState, useEffect } from "react";
import axios from "../../api/axios";

export default function PurchaseOrderDetail() {
  const { clientId, purchaseId } = useParams();
  const navigate = useNavigate();

  const [poData, setPoData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // =========================
  // Fetch Purchase Order
  // =========================
  useEffect(() => {
    const fetchPO = async () => {
      try {
        const res = await axios.get(`/purchase-orders/${purchaseId}`);
        const data = res.data;

        const products = data.products.map((p) => ({
          ...p,
          sizes: p.sizes.reduce((acc, s) => {
            acc[s.sizeName] = s.quantity;
            return acc;
          }, {}),
          newImage: null, // track new uploaded file
        }));

        setPoData({ ...data, products, newInvoice: null });
      } catch (err) {
        console.error("Failed to fetch purchase order:", err);
        alert("Failed to fetch purchase order");
      }
    };
    fetchPO();
  }, [purchaseId]);

  // =========================
  // Handle Product / Sizes / File Changes
  // =========================
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...poData.products];

    if (field.startsWith("size-")) {
      const sizeKey = field.split("-")[1];
      updatedProducts[index].sizes[sizeKey] = Number(value);
    } else if (field === "newImage") {
      updatedProducts[index].newImage = value[0]; // store File
    } else {
      updatedProducts[index][field] = value;
    }

    setPoData({ ...poData, products: updatedProducts });
  };

  const handleInvoiceChange = (file) => {
    setPoData({ ...poData, newInvoice: file[0] });
  };

  const handlePriorityChange = (value) => {
    setPoData({ ...poData, priority: value });
  };

  // =========================
  // Download Purchase Order as Excel
  // =========================
  const downloadCSV = async () => {
    try {
      const token = localStorage.getItem("token"); // JWT token

      const res = await axios.get(
        `/purchase-orders/${purchaseId}/download-csv`,
        {
          responseType: "blob", // ensures binary file download
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${poData.poNumber.replace(/ /g, "_")}.xlsx`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PO Excel:", err);
      alert(err.response?.data?.message || "Failed to download purchase order");
    }
  };

  // =========================
  // Save Updated Purchase Order
  // =========================
  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Top-level fields
      formData.append("poNumber", poData.poNumber);
      formData.append("trackingNumber", poData.trackingNumber);
      formData.append("status", poData.status);
      formData.append("paymentReceived", Number(poData.paymentReceived));
      formData.append("priority", poData.priority); // ✅ Add priority

      // Invoice file
      if (poData.newInvoice) {
        formData.append("invoice", poData.newInvoice);
      }

      // Build full products array
      const productsToSend = poData.products.map((product) => {
        const sizes = Object.entries(product.sizes).map(
          ([sizeName, quantity]) => ({
            sizeName,
            quantity: Number(quantity),
          })
        );

        return {
          productName: product.productName,
          productDescription: product.productDescription || "", // ✅ Include description
          sizes,
        };
      });

      // Append all new product images (if any)
      poData.products.forEach((product) => {
        if (product.newImage) {
          formData.append("productImages", product.newImage);
        }
      });

      // Append products JSON
      formData.append("products", JSON.stringify(productsToSend));

      // Send PUT request
      const res = await axios.put(`/purchase-orders/${purchaseId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedProducts = res.data.products.map((p) => ({
        ...p,
        sizes: p.sizes.reduce((acc, s) => {
          acc[s.sizeName] = s.quantity;
          return acc;
        }, {}),
        newImage: null,
      }));

      setPoData({ ...res.data, products: updatedProducts, newInvoice: null });
      setIsEditing(false);

      alert("Purchase order updated successfully!");
    } catch (err) {
      console.error("Failed to update purchase order:", err);
      alert(err.response?.data?.message || "Failed to update purchase order");
    }
  };

  // =========================
  // Open File (PDF / Image) - CLOUDINARY VERSION
  // =========================
  const openFile = (filePath) => {
    if (!filePath) return;
    // Cloudinary URLs are complete, use them directly
    window.open(filePath, "_blank");
  };

  if (!poData) return <OwnerLayout>Loading purchase order...</OwnerLayout>;

  return (
    <OwnerLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() =>
              navigate(`/owner/clients/${clientId}/purchase-orders`)
            }
            className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
          >
            Back
          </button>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 rounded-xl bg-black font-semibold text-white hover:bg-gray-900 transition"
            >
              Edit
            </button>
          )}
        </div>

        {/* PO Header */}
        <h1 className="text-3xl font-semibold">
          Purchase Order: {poData.poNumber}
        </h1>

        {/* Basic Info */}
        <div className="bg-white rounded-3xl p-8 shadow-md grid sm:grid-cols-2 gap-6">
          {isEditing ? (
            <>
              <input
                type="text"
                value={poData.poNumber}
                onChange={(e) =>
                  setPoData({ ...poData, poNumber: e.target.value })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />
              <input
                type="text"
                value={poData.trackingNumber}
                onChange={(e) =>
                  setPoData({ ...poData, trackingNumber: e.target.value })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />
              <select
                value={poData.status}
                onChange={(e) =>
                  setPoData({ ...poData, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              >
                <option>Tech Pack Received</option>
                <option>Cutting</option>
                <option>Production</option>
                <option>Quality Control</option>
                <option>Completed</option>
              </select>
              <input
                type="number"
                min={0}
                max={100}
                value={poData.paymentReceived}
                onChange={(e) =>
                  setPoData({
                    ...poData,
                    paymentReceived: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />
              <div>
                <p className="text-sm text-gray-500">Add New Invoice</p>
                <input
                  type="file"
                  onChange={(e) => handleInvoiceChange(e.target.files)}
                />
              </div>

              {/* ✅ Priority */}
              <div>
                <p className="text-sm text-gray-500">Edit Priority</p>
              <select
                value={poData.priority || "LOW"}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-2"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>  
              </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-500">PO Number</p>
                <p className="text-lg font-medium">{poData.poNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p className="text-lg font-medium">{poData.trackingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <p className="text-lg font-medium">{poData.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Received</p>
                <p className="text-lg font-medium">{poData.paymentReceived}%</p>
              </div>
              {poData.invoiceFile && (
                <div>
                  <p className="text-sm text-gray-500">Invoice</p>
                  <button
                    onClick={() => openFile(poData.invoiceFile)}
                    className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-200"
                  >
                    View Invoice
                  </button>
                </div>
              )}

              {/* ✅ Priority */}
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    poData.priority === "URGENT"
                      ? "bg-red-100 text-red-700"
                      : poData.priority === "HIGH"
                      ? "bg-orange-100 text-orange-700"
                      : poData.priority === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {poData.priority || "LOW"}
                </span>
              </div>

              <button
                onClick={downloadCSV}
                className="px-4 py-2 rounded-xl border text-medium font-bold text-black hover:bg-gray-200"
              >
                Download PO
              </button>
            </>
          )}
        </div>

        {/* Products */}
        <div className="space-y-6">
          {poData.products.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 shadow-md space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{product.productName}</h2>
                <p className="text-gray-500 font-medium">
                  Total:{" "}
                  {Object.values(product.sizes).reduce((a, b) => a + b, 0)}
                </p>
              </div>

              {/* Product Description */}
              <div>
                {isEditing ? (
                  <textarea
                    value={product.productDescription || ""}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        "productDescription",
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl px-4 py-2 resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700">{product.productDescription}</p>
                )}
              </div>

              {/* Product Image - CLOUDINARY VERSION */}
              <div className="space-y-2">
                <div
                  className="w-32 h-32 border border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer"
                  onClick={() =>
                    openFile(
                      product.newImage
                        ? URL.createObjectURL(product.newImage)
                        : product.productImage
                    )
                  }
                >
                  {product.newImage ? (
                    <img
                      src={URL.createObjectURL(product.newImage)}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : product.productImage ? (
                    <img
                      src={product.productImage}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">No Image</span>
                  )}
                </div>

                {isEditing && (
                  <input
                    type="file"
                    onChange={(e) =>
                      handleProductChange(index, "newImage", e.target.files)
                    }
                  />
                )}
              </div>

              {/* Sizes */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Size Breakdown</p>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                  {Object.entries(product.sizes).map(([size, qty]) => (
                    <div
                      key={size}
                      className="flex flex-col items-center bg-gray-50 rounded-xl p-2"
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={size}
                          onChange={(e) => {
                            const updatedSizes = { ...product.sizes };
                            const valueQty = updatedSizes[size];
                            delete updatedSizes[size];
                            updatedSizes[e.target.value] = valueQty;
                            handleProductChange(index, "sizes", updatedSizes);
                          }}
                          className="text-xs font-medium text-gray-500 w-full text-center border rounded-xl px-1 py-0.5 mb-1"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-500">
                          {size}
                        </span>
                      )}

                      {isEditing ? (
                        <input
                          type="number"
                          value={qty}
                          onChange={(e) =>
                            handleProductChange(
                              index,
                              `size-${size}`,
                              e.target.value
                            )
                          }
                          className="w-full border rounded-xl px-2 py-1 text-center"
                        />
                      ) : (
                        <span className="text-sm font-semibold">{qty}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save / Cancel */}
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-xl bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-black text-white"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}