import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "../LoginForm";
import { supabase } from "@/integrations/supabase/client";
import {
  renderWithProviders,
  createMockUser,
  createMockSession,
  createMockProfile,
} from "./test-utils";

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

// Mock the auth hooks
vi.mock("@/hooks/auth", () => ({
  useLogin: () => ({
    email: "test@example.com",
    setEmail: vi.fn(),
    password: "password123",
    setPassword: vi.fn(),
    loading: false,
    handleLogin: vi.fn((e) => {
      e.preventDefault();
      // This directly calls the mocked Supabase functions
      supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "password123",
      });
    }),
  }),
}));

describe("LoginForm Success Scenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("handles successful login", async () => {
    const mockUser = createMockUser();
    const mockSession = createMockSession(mockUser);
    const mockProfile = createMockProfile(mockUser.id);

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    vi.mocked(supabase.from).mockImplementationOnce(
      () =>
        ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValueOnce({ data: mockProfile, error: null }),
        } as any)
    );

    renderWithProviders(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
