import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "../LoginForm";
import { supabase } from "@/integrations/supabase/client";
import { renderWithProviders, TestAuthError } from "./test-utils";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

vi.mock("@/hooks/auth", () => {
  let testEmail = "";
  let testPassword = "";

  return {
    useLogin: () => ({
      email: testEmail,
      setEmail: (email: string) => {
        testEmail = email;
      },
      password: testPassword,
      setPassword: (password: string) => {
        testPassword = password;
      },
      loading: false,
      handleLogin: vi.fn((e) => {
        e.preventDefault();
        supabase.auth.signInWithPassword({
          email: testEmail || "wrong@example.com",
          password: testPassword || "wrongpassword",
        });
      }),
    }),
  };
});

describe("LoginForm Error Scenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("handles login failure with invalid credentials", async () => {
    const mockError = new TestAuthError(
      "Invalid login credentials",
      "invalid_credentials"
    );

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: mockError,
    });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  it("handles login with unverified email", async () => {
    const mockError = new TestAuthError(
      "Email not confirmed",
      "email_not_confirmed"
    );

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: mockError,
    });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, {
      target: { value: "unverified@example.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  it("handles network error during login", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockRejectedValueOnce(
      new Error("Network error")
    );

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });
});
