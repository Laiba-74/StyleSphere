import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  ShoppingBag,
  Truck,
  BadgePercent,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
const UserRegister = () => {
  const navigate = useNavigate();
  const { registerUser, storeToken, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }
    try {
      const res = await registerUser(formData, "user");
      storeToken(res.data.token);
      toast.success("User Registered Successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Registration Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.msg || "Server error");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">StyleNest</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Your Style Account
              </h2>
              <p className="text-gray-600">
                Sign up to unlock fashion deals, wishlist items, and fast
                checkout.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-emerald-600 transition"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-emerald-600 transition"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-emerald-600 transition"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-emerald-600 transition"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-4 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-5 w-5 border-b-2 border-white mr-2 rounded-full" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="text-center text-sm text-gray-500">
                Already have an account?
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full flex justify-center py-3 px-4 border-2 border-gray-300 rounded-2xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Sign In Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-32 right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-300" />
          <div className="absolute bottom-32 left-32 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Start Shopping in Style</h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Join fashion lovers across the globe and get exclusive access to
              new arrivals and special offers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-sm">
            <Feature
              icon={<Shield className="w-5 h-5" />}
              title="Safe Shopping"
              desc="Secure payments & data protection"
            />
            <Feature
              icon={<Truck className="w-5 h-5" />}
              title="Fast Delivery"
              desc="Reliable nationwide shipping"
            />
            <Feature
              icon={<BadgePercent className="w-5 h-5" />}
              title="Exclusive Discounts"
              desc="Limited-time deals and seasonal sales"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-center space-x-3 text-white/80">
      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="text-left">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-white/60">{desc}</p>
      </div>
    </div>
  );
}

export default UserRegister;
