import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  type AppRole,
  AuthError,
  ForbiddenError,
  requireRole,
} from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";

export type Session = Awaited<ReturnType<typeof requireRole>>;

interface HandlerContext<TParams, TSession> {
  params: Promise<TParams>;
  session: TSession;
}

type RouteContext<TParams> = { params: Promise<TParams> };

type RouteHandler<TParams> = (
  request: Request,
  context: RouteContext<TParams>,
) => Promise<Response>;

interface WithApiHandlerOptions {
  /** Console.error label, e.g. "GET /api/units". */
  label: string;
  /** Message returned to the client on unexpected (500) errors. */
  genericErrorMessage?: string;
}

interface WithRoleOptions extends WithApiHandlerOptions {
  role: AppRole;
}

interface WithoutRoleOptions extends WithApiHandlerOptions {
  role?: undefined;
}

/**
 * Wraps a Next.js route handler with the auth check + error cascade every
 * API route in this project needs: 401 on AuthError, 403 on ForbiddenError,
 * 400 with flattened details on ZodError, and a 500 with a message that
 * never leaks internals to the client.
 */
export function withApiHandler<TParams = Record<string, never>>(
  handler: (
    request: Request,
    context: HandlerContext<TParams, Session>,
  ) => Promise<Response>,
  options: WithRoleOptions,
): RouteHandler<TParams>;
export function withApiHandler<TParams = Record<string, never>>(
  handler: (
    request: Request,
    context: HandlerContext<TParams, null>,
  ) => Promise<Response>,
  options: WithoutRoleOptions,
): RouteHandler<TParams>;
export function withApiHandler<TParams = Record<string, never>>(
  handler: (
    request: Request,
    context: HandlerContext<TParams, never>,
  ) => Promise<Response>,
  options: WithApiHandlerOptions & { role?: AppRole },
): RouteHandler<TParams> {
  return async (request: Request, routeContext?: RouteContext<TParams>) => {
    try {
      const session = options.role
        ? await requireRole(request, options.role)
        : null;
      const params = routeContext?.params ?? Promise.resolve({} as TParams);
      // `never` above only exists to make this implementation signature
      // compatible with both overloads above (whose `session` types are
      // disjoint). The real, safe type is restored here in one place.
      const runHandler = handler as unknown as (
        request: Request,
        context: HandlerContext<TParams, Session | null>,
      ) => Promise<Response>;
      return await runHandler(request, { params, session });
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid payload", details: error.flatten() },
          { status: 400 },
        );
      }
      console.error(`${options.label} -`, getErrorMessage(error));
      return NextResponse.json(
        { error: options.genericErrorMessage ?? "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
