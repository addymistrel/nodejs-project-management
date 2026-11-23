import React, { useState, type ReactNode } from 'react';
import type { AuthState, LoginCredentials, SignupCredentials } from '@/types';
import { clearAuthData, getAccessToken, getRefreshToken, getUser, setAuthData } from '@/utils';
import { authService } from '@/services';
import { AuthContext } from './auth-context-value';

export interface AuthProviderProps {
  children: ReactNode;
}

const getInitialAuthState = (): AuthState => {
  const token = getAccessToken();
  const refreshToken = getRefreshToken();
  const user = getUser();

  if (token && refreshToken && user) {
    return {
      user,
      token,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    };
  }

  return {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(getInitialAuthState);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const data = await authService.login(credentials);
    setAuthData(data);
    setState({
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const signup = async (credentials: SignupCredentials): Promise<void> => {
    const data = await authService.signup(credentials);
    setAuthData(data);
    setState({
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = (): void => {
    clearAuthData();
    setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
