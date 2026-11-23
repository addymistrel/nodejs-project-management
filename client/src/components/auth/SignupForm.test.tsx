import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SignupForm } from './SignupForm';
import { useAuth } from '@/context';
import { AUTH_MESSAGES } from '@/constants';

vi.mock('@/context', () => ({
  useAuth: vi.fn(),
}));

describe('SignupForm (TDD)', () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      signup: mockSignup,
      logout: vi.fn(),
    });
  });

  it('should render name, email, and password inputs and submit button', () => {
    render(
      <BrowserRouter>
        <SignupForm />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(AUTH_MESSAGES.NAME_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_MESSAGES.EMAIL_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_MESSAGES.PASSWORD_LABEL)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: AUTH_MESSAGES.SUBMIT_SIGNUP })).toBeInTheDocument();
  });

  it('should call signup on submission with valid inputs', async () => {
    mockSignup.mockResolvedValueOnce(undefined);

    render(
      <BrowserRouter>
        <SignupForm />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(AUTH_MESSAGES.NAME_LABEL), {
      target: { value: 'Alice Smith' },
    });
    fireEvent.change(screen.getByLabelText(AUTH_MESSAGES.EMAIL_LABEL), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(AUTH_MESSAGES.PASSWORD_LABEL), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: AUTH_MESSAGES.SUBMIT_SIGNUP }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'Password123!',
      });
    });
  });

  it('should display error message when signup fails', async () => {
    mockSignup.mockRejectedValueOnce(new Error('Email already registered'));

    render(
      <BrowserRouter>
        <SignupForm />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(AUTH_MESSAGES.NAME_LABEL), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText(AUTH_MESSAGES.EMAIL_LABEL), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(AUTH_MESSAGES.PASSWORD_LABEL), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: AUTH_MESSAGES.SUBMIT_SIGNUP }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });
});
