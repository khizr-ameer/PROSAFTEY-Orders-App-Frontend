import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import axios from "../../api/axios";

export default function CreatePurchaseOrder() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [poNumber, setPoNumber] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [status, setStatus] = useState("Tech Pack Received");
  const [paymentReceived, setPaymentReceived] = useState();
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [priority, setPriority] = useState("MEDIUM"); // ✅ NEW: priority
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([
    {
      productName: "",
      productDescription: "", // ✅ NEW: description
      sizes: [{ sizeName: "", quantity: "" }],
      quantity: 0,
      productImage: null,
    },
  ]);

  /* =========================
     Helpers
  ========================= */

  const calculateTotalQuantity = (sizes) =>
    sizes.reduce((sum, s) => sum + Number(s.quantity || 0), 0);

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const handleSizeChange = (pIndex, sIndex, field, value) => {
    const updated = [...products];
    updated[pIndex].sizes[sIndex][field] = value;

    updated[pIndex].quantity = calculateTotalQuantity(
      updated[pIndex].sizes
    );

    setProducts(updated);
  };

  const addSize = (pIndex) => {
    const updated = [...products];
    updated[pIndex].sizes.push({ sizeName: "", quantity: "" });
    setProducts(updated);
  };

  const removeSize = (pIndex, sIndex) => {
    const updated = [...products];
    updated[pIndex].sizes.splice(sIndex, 1);

    updated[pIndex].quantity = calculateTotalQuantity(
      updated[pIndex].sizes
    );

    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        productName: "",
        productDescription: "", // ✅ NEW
        sizes: [{ sizeName: "", quantity: "" }],
        quantity: 0,
        productImage: null,
      },
    ]);
  };

  const removeProduct = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!poNumber.trim()) {
      return alert("PO Number is required");
    }

    if (products.length === 0) {
      return alert("At least one product is required");
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Core fields
      formData.append("clientId", clientId);
      formData.append("poNumber", poNumber.trim());
      formData.append("trackingNumber", trackingNumber.trim());
      formData.append("status", status);
      formData.append("paymentReceived", Number(paymentReceived));
      formData.append("priority", priority); // ✅ NEW: priority

      // Invoice
      if (invoiceFile) {
        formData.append("invoice", invoiceFile);
      }

      // Product images (ORDER MATTERS)
      products.forEach((product) => {
        if (product.productImage) {
          formData.append("productImages", product.productImage);
        }
      });

      // Products JSON (WITH productDescription)
      formData.append(
        "products",
        JSON.stringify(
          products.map(({ productImage, ...rest }) => rest)
        )
      );

      await axios.post("/purchase-orders", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/owner/clients/${clientId}/purchase-orders`);
    } catch (err) {
      console.error("Create Purchase Order Error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to create purchase order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <OwnerLayout>
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-3xl shadow-md">
        <h1 className="text-3xl font-semibold mb-8">
          Create Purchase Order
        </h1>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="grid sm:grid-cols-3 gap-6">
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="PO Number"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            />

            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking Number"
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            />

            {/* ✅ Priority */}
           <div>
            <p className="text-sm text-gray-500">Set Priority</p>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
            </div>
          </div>

          {/* Status + Payment */}
          <div className="grid sm:grid-cols-2 gap-6">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
              value={paymentReceived}
              onChange={(e) => setPaymentReceived(e.target.value)}
              placeholder="Payment Received"
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            />
          </div>

          {/* Invoice */}
          <div>
            <p className="text-sm text-gray-500">Add Invoice</p>
          <input
            type="file"
            onChange={(e) => setInvoiceFile(e.target.files[0])}
          />
          </div>
          {/* Products */}
          <div className="space-y-10">
            {products.map((product, pIndex) => (
              <div
                key={pIndex}
                className="border rounded-3xl p-6 space-y-6"
              >
                <div className="flex justify-between">
                  <h3 className="text-xl font-semibold">
                    Product {pIndex + 1}
                  </h3>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(pIndex)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={product.productName}
                  onChange={(e) =>
                    handleProductChange(
                      pIndex,
                      "productName",
                      e.target.value
                    )
                  }
                  placeholder="Product Name"
                  required
                  className="w-full border rounded-xl px-4 py-3"
                />

                {/* ✅ Product Description */}
                <textarea
                  value={product.productDescription}
                  onChange={(e) =>
                    handleProductChange(
                      pIndex,
                      "productDescription",
                      e.target.value
                    )
                  }
                  placeholder="Product Description"
                  className="w-full border rounded-xl px-4 py-3 resize-none"
                  rows={3}
                />

                {/* Sizes */}
                <div className="space-y-3">
                  {product.sizes.map((size, sIndex) => (
                    <div key={sIndex} className="flex gap-3">
                      <input
                        placeholder="Size (S, 32, Free Size)"
                        value={size.sizeName}
                        onChange={(e) =>
                          handleSizeChange(
                            pIndex,
                            sIndex,
                            "sizeName",
                            e.target.value
                          )
                        }
                        className="flex-1 border rounded-xl px-3 py-2"
                      />
                      <input
                        type="number"
                        min={0}
                        value={size.quantity}
                        onChange={(e) =>
                          handleSizeChange(
                            pIndex,
                            sIndex,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="w-32 border rounded-xl px-3 py-2"
                      />
                      {product.sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSize(pIndex, sIndex)}
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSize(pIndex)}
                    className="text-sm text-blue-600"
                  >
                    + Add Size
                  </button>
                </div>

                <p className="text-sm text-gray-600">
                  Total Quantity:{" "}
                  <strong>{product.quantity}</strong>
                </p>

                <input
                  type="file"
                  onChange={(e) =>
                    handleProductChange(
                      pIndex,
                      "productImage",
                      e.target.files[0]
                    )
                  }
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addProduct}
              className="px-6 py-3 rounded-xl bg-gray-100"
            >
              + Add Product
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() =>
                navigate(`/owner/clients/${clientId}/purchase-orders`)
              }
              className="px-6 py-3 rounded-xl bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-black text-white disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Purchase Order"}
            </button>
          </div>
        </form>
      </div>
    </OwnerLayout>
  );
}
