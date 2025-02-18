import { LoginHeader } from "@/components/auth/LoginHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginFooter } from "@/components/auth/LoginFooter";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F4F7FF] via-white to-[#F8F7FF]">
      <LoginHeader />
      
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="text-sm text-gray-600">
              Sign in to access your account
            </p>
          </div>

          <LoginForm />
        </div>

        <LoginFooter />
      </div>
    </div>
  );
};

export default Login;