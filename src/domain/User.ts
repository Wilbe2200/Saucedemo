import { ValidationError } from "./errors";

/** Representa una cuenta y encapsula sus credenciales de autenticación. */
export class User {
  private readonly userId: string;
  private readonly userEmail: string;
  private readonly userPasswordHash: string;

  constructor(id: string, email: string, passwordHash: string) {
    if (!id || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("A valid email is required.");
    if (!passwordHash) throw new ValidationError("Password hash is required.");
    this.userId = id;
    this.userEmail = email.toLowerCase();
    this.userPasswordHash = passwordHash;
  }

  get id(): string { return this.userId; }
  get email(): string { return this.userEmail; }
  get passwordHash(): string { return this.userPasswordHash; }
}
