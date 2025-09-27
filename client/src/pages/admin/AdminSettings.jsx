import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getSettings, updateSettings } from "../../api/setting";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.data) setSettings(res.data);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        toast.error("Failed to load settings");
      });
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      const { data } = await updateSettings(settings);
      setSettings(data.settings);
      toast.success("✅ Settings updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save settings");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Site Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings?.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings?.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={settings?.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              rows={3}
              value={settings?.siteDescription}
              onChange={(e) => handleChange("siteDescription", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={settings?.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
