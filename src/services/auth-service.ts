import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '#/database';
import * as repositoryFunctions from '#/repositories';
import { EmailAlreadyExistsException, InvalidCredentialsException } from '#/utils';
import { environmentConfig } from '#/config';

interface AuthRepository {
  createUser: typeof repositoryFunctions.createUserRecord;
  findByEmail: typeof repositoryFunctions.findUserByEmail;
  findById: typeof repositoryFunctions.findUserById;
}

interface AuthUserResponse {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  user: AuthUserResponse;
  token: string;
  refreshToken: string;
}

interface RefreshResponse {
  token: string;
  refreshToken: string;
}

const defaultAuthRepository: AuthRepository = {
  createUser: (...args) => repositoryFunctions.createUserRecord(...args),
  findByEmail: (...args) => repositoryFunctions.findUserByEmail(...args),
  findById: (...args) => repositoryFunctions.findUserById(...args),
};

class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.repository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.repository.createUser(name.trim(), normalizedEmail, passwordHash);
    return this.createAuthResponse(user);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.repository.findByEmail(normalizedEmail);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new InvalidCredentialsException();
    }

    return this.createAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const refreshSecret = this.getRefreshSecret();

    let payload: jwt.JwtPayload;
    try {
      const decoded = jwt.verify(refreshToken, refreshSecret, {
        issuer: 'nodejs-project-management',
      });
      if (typeof decoded === 'string' || decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }
      payload = decoded;
    } catch {
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    if (typeof payload.sub !== 'string' && typeof payload.sub !== 'number') {
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    const user = await this.repository.findById(Number(payload.sub));
    if (!user) {
      throw new InvalidCredentialsException('Invalid refresh token');
    }

    const tokens = this.createTokens(user);
    return tokens;
  }

  private createAuthResponse(user: UserModel): AuthResponse {
    return {
      user: { id: user.id, name: user.name, email: user.email },
      ...this.createTokens(user),
    };
  }

  private createTokens(user: UserModel): Pick<AuthResponse, 'token' | 'refreshToken'> {
    const secret = environmentConfig.jwtSecret;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, secret, {
      expiresIn: '1h',
      issuer: 'nodejs-project-management',
    });

    const refreshToken = jwt.sign(
      { sub: user.id, email: user.email, type: 'refresh' },
      this.getRefreshSecret(),
      { expiresIn: '7d', issuer: 'nodejs-project-management' },
    );

    return { token, refreshToken };
  }

  private getRefreshSecret(): string {
    const secret = environmentConfig.jwtRefreshSecret;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET or JWT_SECRET is not configured');
    }
    return secret;
  }
}

const authService = new AuthService(defaultAuthRepository);
const signup = authService.signup.bind(authService);
const login = authService.login.bind(authService);
const refresh = authService.refresh.bind(authService);

export { AuthService, login, refresh, signup };
export type { AuthRepository, AuthResponse, AuthUserResponse, RefreshResponse };
