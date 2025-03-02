import { useState } from "react";
import { SignJWT } from 'jose';

const ApiTest = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "quarterly",
    startDate: "",
    endDate: "",
    eventName: "",
    score: 0,
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  // Hàm cập nhật form data
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Kiểm tra logic ngày (Không cho phép chọn endDate trước startDate)
    if (name === "startDate" && formData.endDate && value > formData.endDate) {
      alert("Ngày bắt đầu không thể sau ngày kết thúc");
      return;
    }
    if (name === "endDate" && formData.startDate && value < formData.startDate) {
      alert("Ngày kết thúc không thể trước ngày bắt đầu");
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Hàm lấy token
  const getToken = async (payload: any /** data's json here */): Promise<string> => {
    return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime("1d").sign(new TextEncoder().encode(process.env.REACT_APP_SECRET_JWT));
  };

  // Hàm xử lý gửi API
  const handleCreateProduct = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const token = await getToken({...formData});

      const productResponse = await fetch("http://localhost:3000/product/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Dùng token từ localStorage
        },
        body: JSON.stringify({ ...formData, __v: 0 }),
      });

      const productResult = await productResponse.json();
      console.log("Product Response:", productResult);

      if (!productResponse.ok) {
        throw new Error(productResult.message || "Lỗi khi tạo sản phẩm");
      }

      // Nếu BE trả về token mới, lưu vào localStorage
      if (productResult.token) {
        console.log("New JWT Token:", productResult.token);
        localStorage.setItem("jwtToken", productResult.token);
      }

      setResponse(`✅ Thành công: ${JSON.stringify(productResult, null, 2)}`);
    } catch (error) {
      console.error("Error:", error);
      setResponse(`❌ Lỗi: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Test API: Create Product & Send Notification</h2>

      <label className="block font-medium">Name:</label>
      <input className="w-full p-2 border rounded mb-2" type="text" name="name" value={formData.name} onChange={handleChange} />

      <label className="block font-medium">Type:</label>
      <select className="w-full p-2 border rounded mb-2" name="type" value={formData.type} onChange={handleChange}>
        <option value="quarterly">Quarterly</option>
        <option value="year">Year</option>
      </select>

      <label className="block font-medium">Start Date:</label>
      <input className="w-full p-2 border rounded mb-2" type="date" name="startDate" value={formData.startDate} onChange={handleChange} />

      <label className="block font-medium">End Date:</label>
      <input className="w-full p-2 border rounded mb-2" type="date" name="endDate" value={formData.endDate} onChange={handleChange} />

      <label className="block font-medium">Event Name:</label>
      <input className="w-full p-2 border rounded mb-2" type="text" name="eventName" value={formData.eventName} onChange={handleChange} />

      <label className="block font-medium">Score:</label>
      <input className="w-full p-2 border rounded mb-2" type="number" name="score" value={formData.score} onChange={handleChange} />

      <button className="w-full p-2 bg-blue-500 text-white rounded mt-4" onClick={handleCreateProduct} disabled={loading}>
        {loading ? "Đang xử lý..." : "Gửi API"}
      </button>

      {response && <pre className="bg-gray-100 p-3 rounded mt-3">{response}</pre>}
    </div>
  );
};

export default ApiTest;
