import type {
  ActionFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { createUserSession, getUserId } from "~/session.server";
import { createUser, getProfileByEmail } from "~/models/user.server";
import { validateEmail } from "~/utils";
import * as React from "react";

export const meta: MetaFunction = () => {
  return {
    title: "Registrarse",
  };
};

interface ActionData {
  errors: {
    email?: string;
    password?: string;
  };
}

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");

  // Ensure the email is valid
  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Correo Electrónico invalido." } },
      { status: 400 }
    );
  }

  // What if a user sends us a password through other means than our form?
  if (typeof password !== "string") {
    return json(
      { errors: { password: "Contraseña no valida." } },
      { status: 400 }
    );
  }

  // Enforce minimum password length
  if (password.length < 6) {
    return json<ActionData>(
      { errors: { password: "Contraseña es muy corta." } },
      { status: 400 }
    );
  }

  // A user could potentially already exist within our system
  // and we should communicate that well
  const existingUser = await getProfileByEmail(email);
  if (existingUser) {
    return json<ActionData>(
      { errors: { email: "Existe un usuario registrado con el correo electrónico." } },
      { status: 400 }
    );
  }

  const user = await createUser(email, password);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;

  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef?.current?.focus();
    }

    if (actionData?.errors?.password) {
      passwordRef?.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <div className="fixed inset-0">
          <img
            className="h-full w-full object-cover"
            src="https://raw.githubusercontent.com/Gonzalox2/boxsanfelipe-sitio/2e5fabeecd10995ceee88591e649cfa2683167d1/app/images/Box_Background.jpg"                
            alt="Box Sanfelipe, zona interior"
          />
          <div className="absolute inset-0 bg-[color:rgba(0,0,0,0.5)] mix-blend-multiply" />
        </div>         
        <Form className="space-y-6" method="post" noValidate>
          <div className="relative w-full h-full">
            <label className="text-sm font-medium" htmlFor="email">
              <span className="block text-white">Correo Electrónico</span>
              {actionData?.errors?.email && (
                <span className="block pt-1 text-red-700" id="email-error">
                  {actionData?.errors?.email}
                </span>
              )}
            </label>
            <input
              className="w-full rounded border border-red-500 px-2 py-1 text-lg"
              type="email"
              name="email"
              id="email"
              required
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
              ref={emailRef}
            />
          </div>
          <div className="relative w-full h-full">
            <label className="text-sm font-medium" htmlFor="password">
              <span className="block text-white">Contraseña</span>
              <span className="block font-light text-white">
                Debe contener al menos 6 caracteres.
              </span>
              {actionData?.errors?.password && (
                <span className="pt-1 text-red-700" id="password-error">
                  {actionData?.errors?.password}
                </span>
              )}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="w-full rounded border border-red-500 px-2 py-1 text-lg"
              autoComplete="Contraseña"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
              ref={passwordRef}
            />
          </div>
          <button
            className="relative w-full rounded bg-red-500  py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
            type="submit">
            Registrar Usuario
          </button>
          <div className="relative w-full">
            <Link
              to="/"
              className="relative space-y-6 w-full rounded bg-gray-500  py-2 px-4 text-white hover:bg-gray-600 focus:bg-gray-400"
            >
              Volver
            </Link>          
          </div>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="relative flex items-center justify-center">
            <div className="text-center text-sm text-white">
              ¿Ya posees una cuenta?{" "}
              <Link
                className="text-red-500 underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>        
        </Form>
      </div>
    </div>
  );
}
