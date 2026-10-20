import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthenticationError, ValidationError } from "@/domain/errors";
import { IUserRepository } from "@/repositories/IUserRepository";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(100),
});

/** Gestiona el registro y la comprobación de credenciales de usuario. */
export class AuthService {
  constructor(private readonly users: IUserRepository) {}

  async register(input: unknown): Promise<{ id: string; email: string }> {
    const data = this.parse(input);
    if (await this.users.findByEmail(data.email)) throw new ValidationError("An account with this email already exists.");
    const user = await this.users.create(data.email, await bcrypt.hash(data.password, 12));
    return { id: user.id, email: user.email };
  }

  async login(input: unknown): Promise<{ id: string; email: string }> {
    const data = this.parse(input);
    const user = await this.users.findByEmail(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) throw new AuthenticationError();
    return { id: user.id, email: user.email };
  }

  private parse(input: unknown): z.infer<typeof credentialsSchema> {
    const parsed = credentialsSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid credentials.");
    return parsed.data;
  }
}
