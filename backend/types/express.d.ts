export {};

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string } | undefined;
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}