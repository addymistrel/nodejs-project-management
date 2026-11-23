import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';
import { APP_ROUTES, AUTH_MESSAGES } from '@/constants';
import { Button, Input } from '@/components/common';

export const SignupForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signup({ name, email, password });
      navigate(APP_ROUTES.DASHBOARD);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(AUTH_MESSAGES.DEFAULT_ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label={AUTH_MESSAGES.NAME_LABEL}
        type="text"
        placeholder={AUTH_MESSAGES.NAME_PLACEHOLDER}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        label={AUTH_MESSAGES.EMAIL_LABEL}
        type="email"
        placeholder={AUTH_MESSAGES.EMAIL_PLACEHOLDER}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        label={AUTH_MESSAGES.PASSWORD_LABEL}
        type="password"
        placeholder={AUTH_MESSAGES.PASSWORD_PLACEHOLDER}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
        {AUTH_MESSAGES.SUBMIT_SIGNUP}
      </Button>

      <p className="text-center text-sm text-zinc-500 mt-2">
        {AUTH_MESSAGES.ALREADY_HAVE_ACCOUNT_PROMPT}{' '}
        <Link
          to={APP_ROUTES.LOGIN}
          className="font-medium text-indigo-600 hover:text-indigo-500 underline"
        >
          {AUTH_MESSAGES.LOGIN_LINK_TEXT}
        </Link>
      </p>
    </form>
  );
};
