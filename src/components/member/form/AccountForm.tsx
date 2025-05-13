import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";

type AccountData = {
  email: string;
  password: string;
  confirmPassword: string;
};

type AccountFormProps = AccountData & {
  updateFields: (fields: Partial<AccountData>) => void;
};

export function AccountForm({
  email,
  password,
  confirmPassword,
  updateFields,
}: AccountFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = password === confirmPassword;

  return (
    <>
      <DialogTitle className="mb-4">Account Information</DialogTitle>

      {/* Username */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center">Username</Label>
        <Input
          type="text"
          value={email}
          readOnly
          className="bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Password */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center">
          Password <span className="text-red-500 ml-1">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => updateFields({ password: e.target.value })}
            required
          />
          <Button
            type="button"
            variant="ghost"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Hide" : "Show"}
          </Button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2 mb-4">
        <Label className="flex items-center">
          Confirm Password <span className="text-red-500 ml-1">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => updateFields({ confirmPassword: e.target.value })}
            required
            className={
              confirmPassword && !passwordsMatch
                ? "border-red-500"
                : confirmPassword && passwordsMatch
                ? "border-green-500"
                : ""
            }
          />
          <Button
            type="button"
            variant="ghost"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </Button>
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
        )}
        {confirmPassword && passwordsMatch && (
          <p className="text-green-500 text-sm mt-1">Passwords match</p>
        )}
      </div>
    </>
  );
}