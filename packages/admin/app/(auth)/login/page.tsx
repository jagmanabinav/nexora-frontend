"use client";

import React, { useState } from "react";
import {
  useAuthContext,
  useFormValidation,
  LoginSchema,
  Button,
  Input,
  AuthLayout,
  type LoginFormData,
} from "@nexora/shared";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const {
    errors: validationErrors,
    isSubmitting,
    submitError,
    handleSubmit,
    setSubmitError,
  } = useFormValidation(LoginSchema, {
    onSubmit: async (data: unknown) => {
      const loginData = data as LoginFormData;
      try {
        await login(loginData.email, loginData.password);
        router.push("/dashboard");
      } catch (err: any) {
        throw new Error(
          err.message || "Failed to login. Please check your credentials.",
        );
      }
    },
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    await handleSubmit(formData);
  };

  return (
    <AuthLayout
      title="Nexora Admin"
      subtitle="Super Admin Portal - Manage your platform"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {submitError}
          </div>
        )}

        <div>
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@nexora.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            fullWidth
            error={validationErrors.email}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-600 mt-1">
              {validationErrors.email}
            </p>
          )}
        </div>

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            fullWidth
            error={validationErrors.password}
          />
          {validationErrors.password && (
            <p className="text-sm text-red-600 mt-1">
              {validationErrors.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || authLoading}
          variant="primary"
          fullWidth
        >
          {isSubmitting || authLoading ? "Logging in..." : "Login to Admin"}
        </Button>

        <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Sign in with your Nexora account.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
