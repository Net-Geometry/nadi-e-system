import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if there's a valid hash in the URL
  useEffect(() => {
    const checkHash = async () => {
      const hash = window.location.hash.substring(1);
      if (!hash) {
        setError("Invalid or missing reset token");
        return;
      }

      try {
        // Verify the hash is valid
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          setError(
            "Invalid or expired reset token. Please request a new password reset link."
          );
        }
      } catch (err) {
        console.error("Error verifying reset token:", err);
        setError("An error occurred. Please try again.");
      }
    };

    checkHash();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Password updated",
        description: "Your password has been reset successfully",
      });

      // Clear any stored auth data
      localStorage.removeItem("session");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to reset password. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        {error ? (
          <div className="text-center py-6">
            <div className="rounded-full w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Reset link invalid
            </h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => navigate("/forgot-password")}
              className="w-full"
            >
              Request new reset link
            </Button>
          </div>
        ) : success ? (
          <div className="text-center py-6">
            <div className="rounded-full w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Password updated!
            </h2>
            <p className="text-gray-500 mb-6">
              Your password has been reset successfully. You'll be redirected to
              the login page shortly.
            </p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to login
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Create new password
              </h1>
              <p className="text-gray-500 mt-2">
                Your password must be at least 6 characters
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
