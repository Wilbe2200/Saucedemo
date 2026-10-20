/** Error base para convertir fallos de dominio en respuestas HTTP coherentes. */
export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** Indica que el recurso solicitado no existe. */
export class NotFoundError extends ApplicationError {
  constructor(message = "Resource not found.") {
    super(message, 404);
  }
}

/** Indica que la entrada incumple las reglas del dominio. */
export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 400);
  }
}

/** Indica que las credenciales no autorizan la operación. */
export class AuthenticationError extends ApplicationError {
  constructor(message = "Invalid email or password.") {
    super(message, 401);
  }
}
