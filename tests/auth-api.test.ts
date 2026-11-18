import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailAlreadyExistsException, InvalidCredentialsException } from '#/utils';

const authService = {
  signup: vi.fn(),
  login: vi.fn(),
  refresh: vi.fn(),
};

vi.mock('#/services', () => authService);

const { app } = await import('#/app.js');

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs up a user and returns a token', async () => {
    authService.signup.mockResolvedValue({
      user: { id: 1, name: 'Aditya', email: 'aditya@example.com' },
      token: 'signed-token',
      refreshToken: 'signed-refresh-token',
    });

    const response = await request(app).post('/api/v1/auth/signup').send({
      name: 'Aditya',
      email: 'aditya@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.token).toBe('signed-token');
    expect(response.body.data.refreshToken).toBe('signed-refresh-token');
  });

  it('logs in a user and returns a token', async () => {
    authService.login.mockResolvedValue({
      user: { id: 1, name: 'Aditya', email: 'aditya@example.com' },
      token: 'signed-token',
      refreshToken: 'signed-refresh-token',
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'aditya@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBe('signed-token');
    expect(response.body.data.refreshToken).toBe('signed-refresh-token');
  });

  it('refreshes an access token with a valid refresh token', async () => {
    authService.refresh.mockResolvedValue({
      token: 'new-signed-token',
      refreshToken: 'new-signed-refresh-token',
    });

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'signed-refresh-token' });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      token: 'new-signed-token',
      refreshToken: 'new-signed-refresh-token',
    });
  });

  it('rejects duplicate email addresses', async () => {
    authService.signup.mockRejectedValue(new EmailAlreadyExistsException());

    const response = await request(app).post('/api/v1/auth/signup').send({
      name: 'Aditya',
      email: 'aditya@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(409);
  });

  it('rejects invalid login credentials', async () => {
    authService.login.mockRejectedValue(new InvalidCredentialsException());

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'aditya@example.com',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
  });
});
