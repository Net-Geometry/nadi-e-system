import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemberLogin } from "@/hooks/auth";

export const LoginFormMember = () => {
  const { icNumber, setIcNumber, password, setPassword, loading, handleLogin } =
    useMemberLogin();

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="icNumber"
            className="text-sm font-medium text-gray-700"
          >
            Identification No / Membership ID
          </Label>
          <Input
            id="icNumber"
            type="text"
            value={icNumber}
            onChange={(e) => {
              // Remove any spaces or dashes that might be entered
              const cleanedValue = e.target.value.replace(/[\s-]/g, "");
              setIcNumber(cleanedValue);
            }}
            placeholder="Enter your Identification No or membership ID"
            className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <Link
              to="/forgot-password"
              state={{ from: "login" }}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        size="lg"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Member Sign In"}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Don't have an account?
          </span>
        </div>
      </div>

      <Link
        to="/register"
        className="block w-full text-center py-3 px-4 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
      >
        Create an account
      </Link>
    </form>
  );
};
