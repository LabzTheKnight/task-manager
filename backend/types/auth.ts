export type AuthTokenPayload = {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
};

export type AuthenticatedUser = {
  id: number;
  email: string;
};