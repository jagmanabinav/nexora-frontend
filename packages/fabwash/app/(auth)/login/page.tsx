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
import Link from "next/link";

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
    <AuthLayout title="FabWash" subtitle="Textile Fabric Washing Management">
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
            placeholder="user@example.com"
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
          {isSubmitting || authLoading ? "Logging in..." : "Login to FabWash"}
        </Button>

        <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
          <p>Manage textile fabric receiving and washing operations</p>
          <p className="mt-3">
            New company?{" "}
            <Link
              href="/"
              className="font-medium text-blue-700 hover:underline"
            >
              Choose an application and register
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
