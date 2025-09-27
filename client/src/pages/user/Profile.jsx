import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Pencil,
  Check,
  Camera,
  Trash,
} from "lucide-react";
import { changePassword, FetchUser, UpdateUser } from "../../api/auth";
import {
  createShippingAddress,
  deleteShipping,
  getUserShippingAddresses,
  updateShipping,
} from "../../api/shipping";
import toast from "react-hot-toast";

const Profile = () => {
  const [user, setUser] = useState({ name: "", avatar: null });
  const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [editingAddressId, setEditingAddressId] = useState(null);
  const validatePhone = (phone) => {
    const cleaned = phone.replace(/[\s()-]/g, "");
    return /^\+?[0-9]{9,15}$/.test(cleaned);
  };
  const validateZip = (zip) => /^[0-9]{4,10}$/.test(zip);
  const validateCityState = (value) => /^[A-Za-z\s]{2,50}$/.test(value);
  const validatePasswordStrength = (password) =>
    /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  const [formData, setFormData] = useState({
    name: "",
    avatar: null,
    phone: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const getImageUrl = (path) => {
    if (!path) return null;
    return path.startsWith("http")
      ? path
      : `${import.meta.env.VITE_SERVER}/${path.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profileResponse = await FetchUser();
        setUser(profileResponse.data.user);
        setFormData((prev) => ({
          ...prev,
          name: profileResponse.data.user.name,
        }));

        const addressesResponse = await getUserShippingAddresses();
        setAddresses(addressesResponse.data.addresses);
      } catch (err) {
        toast.error("Failed to fetch data. Please try again.");
        console.error("Fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleImageError = () => {
    toast.error("Failed to load avatar image.");
    console.error("Image load error for URL:", getImageUrl(user.avatar));
  };

  const handleSubmit = async (e) => {
    setLoading(true);

    if (!formData.name) {
      toast.error("Name is required.");
      setLoading(false);
      return;
    }
    try {
      const profileData = new FormData();
      if (formData.name) profileData.append("name", formData.name);
      if (formData.avatar) profileData.append("avatar", formData.avatar);

      const profileResponse = await UpdateUser(user.userId, profileData);

      setUser(profileResponse.data.user);
      if (profileResponse.data.token) {
        localStorage.setItem("token", profileResponse.data.token);
      }
      setFormData({
        name: profileResponse.data.user.name,
        avatar: null,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      setIsEditing(false);

      toast.success("Profile and address updated successfully!");
    } catch (err) {
      toast.error("Failed to update data. Please try again.");
      console.error("Update error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setFormData((prev) => ({ ...prev, name: user.name }));
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      setLoading(true);
      await deleteShipping(id);
      setAddresses((prev) => prev.filter((addr) => addr._id !== id));
      toast.success("Address deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete address!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setFormData({
      ...formData,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
    });
    setEditingAddressId(address._id);
  };

  const handleShippingSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { phone, address, city, state, zipcode } = formData;

    if (!validatePhone(phone)) {
      toast.error("Phone must be 10–15 digits.");
      setLoading(false);
      return;
    }
    const cleanedPhone = phone.replace(/[\s()-]/g, "");
    if (!validateZip(zipcode)) {
      toast.error("Zipcode must be 4–10 digits.");
      setLoading(false);
      return;
    }
    if (!validateCityState(city) || !validateCityState(state)) {
      toast.error("City/State must only contain letters.");
      setLoading(false);
      return;
    }
    if (!address.trim()) {
      toast.error("Address cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      if (editingAddressId) {
        const response = await updateShipping(editingAddressId, {
          phone: cleanedPhone,
          address,
          city,
          state,
          zipcode,
        });
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === editingAddressId ? response.data.address : addr
          )
        );
        toast.success("Address updated successfully!");
        setEditingAddressId(null);
      } else {
        const response = await createShippingAddress({
          phone: cleanedPhone,
          address,
          city,
          state,
          zipcode,
        });
        setAddresses((prev) => [...prev, response.data.address]);
        toast.success("Shipping address saved successfully!");
      }
      setFormData({
        ...formData,
        phone: "",
        address: "",
        city: "",
        state: "",
        zipcode: "",
      });
    } catch {
      toast.error("Failed to save shipping address.");
    } finally {
      setLoading(false);
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!validatePasswordStrength(passwordData.newPassword)) {
      setPasswordError(
        "Password must be 8+ chars, include 1 uppercase & 1 number."
      );
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const res = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess(res.data.message);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <div className="space-y-3 ">
                {addresses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Your Shipping Addresses
                    </h3>
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className="border border-gray-300 p-4 mb-2 rounded-md flex items-center justify-between"
                      >
                        <span className="text-gray-700">
                          {addr.address}, {addr.city}, {addr.state}{" "}
                          {addr.zipcode} ({addr.phone})
                        </span>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Address"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Address"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center mb-6">
                <MapPin className="h-5 w-5 text-[#1c9199] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Shipping Information
                </h2>
              </div>

              <form onSubmit={handleShippingSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZipCode
                    </label>
                    <input
                      type="text"
                      id="zipcode"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                      placeholder="Enter zipcode"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="lg:col-span-2 space-y-8 mt-8">
                  <button
                    type="submit"
                    className="w-full bg-[#1c9199] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#165e66] transition-colors disabled:opacity-50"
                  >
                    {editingAddressId ? "Update Address" : "Add Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 relative">
              <button
                onClick={isEditing ? handleSubmit : toggleEdit}
                type="button"
                className="absolute top-4 right-4 text-gray-500 hover:text-[#1c9199]"
                title={isEditing ? "Save Changes" : "Edit Profile"}
              >
                {isEditing ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Pencil className="h-5 w-5" />
                )}{" "}
              </button>

              <form onSubmit={handleSubmit}>
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview Avatar"
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-amber-700"
                      />
                    ) : user.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt="User Avatar"
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-[#1c9199]"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Avatar</span>
                      </div>
                    )}

                    {isEditing && (
                      <>
                        <input
                          type="file"
                          id="avatar"
                          name="avatar"
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md hover:bg-gray-100"
                        >
                          <Camera className="h-5 w-5 text-gray-600" />
                        </button>
                      </>
                    )}
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-lg font-semibold text-center w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                      placeholder="Enter your name"
                      required
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.name}
                    </h3>
                  )}

                  <p className="text-gray-600">{user?.email}</p>
                  <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full mt-2">
                    {user?.role === "admin" ? "Administrator" : "Customer"}
                  </span>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Change Password
              </h2>

              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    {passwordError && (
                      <p className="text-red-500 mb-4">{passwordError}</p>
                    )}
                    {passwordSuccess && (
                      <p className="text-green-600 mb-4">{passwordSuccess}</p>
                    )}
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="bg-[#1c9199] text-white px-6 py-2 rounded-lg hover:bg-[#165e66] transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
