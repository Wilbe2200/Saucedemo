import { User as UserRow } from "@prisma/client";
import { User } from "@/domain/User";
import { db } from "@/lib/db";
import { IUserRepository } from "./IUserRepository";

/** Implementa el almacenamiento de usuarios en la tabla PostgreSQL users. */
export class PostgresUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const row = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    return row ? this.toDomain(row) : null;
  }

  async create(email: string, passwordHash: string): Promise<User> {
    return this.toDomain(await db.user.create({ data: { email: email.toLowerCase(), passwordHash } }));
  }

  private toDomain(row: UserRow): User {
    return new User(row.id, row.email, row.passwordHash);
  }
}
