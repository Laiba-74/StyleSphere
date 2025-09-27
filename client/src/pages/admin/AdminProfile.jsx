import { useEffect, useState } from "react";
import { changePassword, FetchUser, UpdateUser } from "../../api/auth";
import { User, Edit2, X, Upload, Check, Shield } from "lucide-react";

export default function AdminProfile() {
  const API_URL = import.meta.env.VITE_SERVER;

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [originalAvatar, setOriginalAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await FetchUser();
        setUser(data.user);
        setName(data.user.name);

        const absURL = data.user.avatar
          ? `${API_URL}/${data.user.avatar.replace(/^\/?/, "")}`
          : null;
        setPreview(absURL);
        setOriginalAvatar(absURL);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    loadUser();
  }, [API_URL]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      if (avatar) formData.append("avatar", avatar);

      const { data } = await UpdateUser(user.userId, formData);
      setUser(data.user);
      setPreview(
        data.user.avatar
          ? `${API_URL}/${data.user.avatar.replace(/^\/?/, "")}`
          : null
      );
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setPreview(data.user.avatar ? `${API_URL}${data.user.avatar}` : null);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const updateProfileImage = async (save) => {
    if (!save) {
      setPreview(originalAvatar);
      setAvatar(null);
      return;
    }

    if (!avatar) return alert("No new image selected!");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("avatar", avatar);

      const { data } = await UpdateUser(user.userId, formData);
      const newAvatarUrl = data.user.avatar
        ? `${API_URL}/${data.user.avatar.replace(/^\/?/, "")}?t=${Date.now()}`
        : null;
      setUser(data.user);
      setOriginalAvatar(newAvatarUrl);
      setPreview(newAvatarUrl);
      setAvatar(null);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      alert("Profile image updated!");
    } catch (err) {
      console.error("Error updating avatar:", err);
      alert("Update failed");
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

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
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
      if (err.response && err.response.data.message) {
        setPasswordError(err.response.data.message);
      } else {
        setPasswordError("Something went wrong");
      }
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your administrator account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Personal Information
              </h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                {editMode ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Edit2 className="h-4 w-4" />
                )}
                <span>{editMode ? "Cancel" : "Edit"}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={(e) => setUser(e.target.value)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Join Date
                  </label>
                  <input
                    type="text"
                    name="createdAt"
                    value={new Date(user.createdAt).toLocaleDateString()}
                    onChange={(e) => setUser(e.target.value)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="role"
                    name="role"
                    value={
                      user.role
                        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                        : ""
                    }
                    onChange={(e) => setUser(e.target.value)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {editMode && (
                <div className="lg:col-span-2 space-y-8 mt-8">
                  <button
                    type="submit"
                    className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Change Password
            </h2>

            <form onSubmit={handlePasswordSubmit}>
              {passwordError && (
                <p className="text-red-500 mb-4">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-green-600 mb-4">{passwordSuccess}</p>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-blue-600" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.name}
              </h3>
              <p className="text-gray-600">{user?.email}</p>
              <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                <Shield className="h-3 w-3 mr-1" />
                Administrator
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Admin Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700">
                  View System Logs
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700">
                  Manage Permissions
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700">
                  System Settings
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700">
                  Backup & Export
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h4 className="font-medium text-gray-900 mb-4">Profile Picture</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="profile-image-upload-main"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> a
                      new profile picture
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or JPEG (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    id="profile-image-upload-main"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                {preview ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    {avatar && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateProfileImage(true)}
                          className="text-green-500 hover:text-green-700 "
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateProfileImage(false)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500">No Avatar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
