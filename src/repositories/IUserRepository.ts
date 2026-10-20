import { User } from "@/domain/User";

/** Define el acceso a las cuentas registradas. */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(email: string, passwordHash: string): Promise<User>;
}
