import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from './login-form';
import { useAuth } from '@/context';
import { AUTH_MESSAGES } from '@/constants';

vi.mock('@/context', () => ({
  useAuth: vi.fn(),
}));

describe('LoginForm (TDD)', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      signup: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('should render email and password inputs and submit button', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(AUTH_MESSAGES.EMAIL_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_MESSAGES.PASSWORD_LABEL)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: AUTH_MESSAGES.SUBMIT_LOGIN })).toBeInTheDocument();
  });

  it('should call login on submission with valid inputs', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(AUTH_MESSAGES.EMAIL_LABEL), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(AUTH_MESSAGES.PASSWORD_LABEL), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: AUTH_MESSAGES.SUBMIT_LOGIN }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret123',
      });
    });
  });

  it('should display error message when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(AUTH_MESSAGES.EMAIL_LABEL), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(AUTH_MESSAGES.PASSWORD_LABEL), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: AUTH_MESSAGES.SUBMIT_LOGIN }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
});
