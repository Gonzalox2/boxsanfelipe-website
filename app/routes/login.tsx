import React from "react";
import type {
  ActionFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { validateEmail } from "~/utils";

export const meta: MetaFunction = () => {
  return {
    title: "Login",
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
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json({ errors: { email: "Email is invalid." } }, { status: 400 });
  }

  if (typeof password !== "string") {
    return json(
      { errors: { password: "Valid password is required." } },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return json(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password" } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/notes",
  });
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/notes";

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
        <Form method="post" className="relative space-y-6" noValidate>
          <div>
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
              autoComplete="email"
              type="email"
              name="email"
              id="email"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
              ref={emailRef}
            />
          </div>
          <div>
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
              autoComplete=""
              className="w-full rounded border border-red-500 px-2 py-1 text-lg"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
              ref={passwordRef}
            />
          </div>
          <button
            className="w-full rounded bg-red-500  py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
            type="submit"
          >
            Iniciar Sesión
          </button>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="w-full">
            <Link
              to="/"
              className="space-y-6 w-full rounded bg-gray-500  py-2 px-4 text-white hover:bg-gray-600 focus:bg-gray-400"
            >
              Volver
            </Link>          
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                id="remember"
                name="remember"
                type="checkbox"
              />
              <label
                className="ml-2 block text-sm text-white"
                htmlFor="remember"
              >
                Recuerdame
              </label>
            </div>
            <div className="text-center text-sm text-red-500">
              ¿No tienes una cuenta?{" "}
              <Link
                className="text-red-500 underline"
                to={{ pathname: "/join" }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
