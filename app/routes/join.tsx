import type {
  ActionFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams, useTransition } from "@remix-run/react";
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
    name?: string;
    surname?: string;
    second_surname?: string;
    rut?: string;
    phone?: string;
    email?: string;
    password?: string;
    user?: string;
  },
  success:{
    user?: boolean;
  };
}

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const surname = formData.get("surname");
  const sec_surname = formData.get("second_surname");
  const rut = formData.get("rut");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");
  if(!name){
    return json<ActionData>(
      { errors: { name: "Debes ingresar tu nombre." },success:{user: false }},
      { status: 400 }
    );
  }

  if(!surname){
    return json<ActionData>(
      { errors: { surname: "Debes ingresar tu apellido paterno." },success:{user:false }},
      { status: 400 }
    );
  }

  if(!sec_surname){
    return json<ActionData>(
      { errors: { second_surname: "Debes ingresar tu apellido materno." },success:{user:false }},
      { status: 400 }
    );
  }

  if(!rut){
    return json<ActionData>(
      { errors: { rut: "Debes ingresar tu RUT." },success:{user:false }},
      { status: 400 }
    );
  }

  if(!phone){
    return json<ActionData>(
      { errors: { phone: "Debes ingresar tu telefono." },success:{user:false }},
      { status: 400 }
    );
  }

  // Ensure the email is valid
  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Correo Electrónico invalido." },success:{user:false }},
      { status: 400 }
    );
  }

  // What if a user sends us a password through other means than our form?
  if (typeof password !== "string") {
    return json(
      { errors: { password: "Contraseña no valida." },success:{user:false }},
      { status: 400 }
    );
  }

  // Enforce minimum password length
  if (password.length < 6) {
    return json<ActionData>(
      { errors: { password: "Contraseña es muy corta." },success:{user:false }},
      { status: 400 }
    );
  }
  
  // A user could potentially already exist within our system
  // and we should communicate that well
  //const existingUser = await getProfileByEmail(email);
  //if (existingUser) {
  //  return json<ActionData>(
  //    { errors: { email: "Existe un usuario registrado con el correo electrónico." } },
  //    { status: 400 }
  //  );
  //}
  const user = await createUser(name.valueOf().toString(),surname.valueOf().toString(),sec_surname.valueOf().toString(),rut.valueOf().toString(),phone.valueOf().toString(),email);
  if(user){
    return json<ActionData>(
      { errors: { user: "Registrado con exito" } ,success:{user:true }},
      { status: 400 }
    );
  }
  return json<ActionData>(
    { errors: { user: "Problemas al ingresar registro" },success:{user:false }},
    { status: 400 }
  );
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const {state} = useTransition();
  const busy = state === "submitting";  
  const actionData = useActionData() as ActionData;
  const nameRef = React.useRef<HTMLInputElement>(null);
  const surnameRef = React.useRef<HTMLInputElement>(null);
  const secSurnameRef = React.useRef<HTMLInputElement>(null);
  const rutRef = React.useRef<HTMLInputElement>(null);
  const phoneRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {      
    if (actionData?.errors?.name) {
      nameRef?.current?.focus();
    }

    if (actionData?.errors?.surname) {
      surnameRef?.current?.focus();
    }

    if (actionData?.errors?.second_surname) {
      secSurnameRef?.current?.focus();
    }

    if (actionData?.errors?.rut) {
      rutRef?.current?.focus();
    }
    
    if (actionData?.errors?.phone) {
      phoneRef?.current?.focus();
    }

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
            src="https://raw.githubusercontent.com/Gonzalox2/boxsanfelipe-website/ceb2a996b6e78cbfb5a4cd87e6988a58f33aec4a/app/images/Box_Background.jpg"
            alt="Box Sanfelipe, zona interior"
          />
          <div className="absolute inset-0 bg-[color:rgba(0,0,0,0.5)] mix-blend-multiply" />
          <div className="sweet-loading">
    </div>
        </div>         
        <Form className="relative space-y-6" method="post" noValidate>
          
          <div className="w-full h-full">
            <label className="text-sm font-medium" htmlFor="name">
              <span className="block text-white">Nombres</span>
              {actionData?.errors?.name && (
                <span className="block pt-1 text-red-700" id="name-error">
                  {actionData?.errors?.name}
                </span>
              )}
            </label>
            <input
              className="w-full rounded border border-red-500 px-2 py-1 text-lg"
              type="text"
              name="name"
              id="name"
              required
              aria-invalid={actionData?.errors?.name ? true : undefined}
              aria-describedby="name-error"
              ref={nameRef}
            />
          </div>

          <div className="w-full h-full">
            <label className="text-sm font-medium" htmlFor="surname">
              <span className="block text-white">Apellido Paterno</span>
              {actionData?.errors?.surname && (
                <span className="block pt-1 text-red-700" id="surname-error">
                  {actionData?.errors?.surname}
                </span>
              )}
            </label>
            <input
              className="w-full rounded border border-red-500 px-2 py-1 text-lg"
              type="text"
              name="surname"
              id="surname"
              required
              aria-invalid={actionData?.errors?.surname ? true : undefined}
              aria-describedby="surname-error"
              ref={surnameRef}
            />
          </div>

          <div className="w-full h-full">
            <label className="text-sm font-medium" htmlFor="second_surname">
              <span className="block text-white">Apellido Materno</span>
              {actionData?.errors?.second_surname && (
                <span className="block pt-1 text-red-700" id="second_surname-error">
                  {actionData?.errors?.second_surname}
                </span>
              )}
            </label>
            <input
              className="w-full rounded border border-red-500 px-2 py-1 text-lg"
              type="text"
              name="second_surname"
              id="second_surname"
              required
              aria-invalid={actionData?.errors?.second_surname ? true : undefined}
              aria-describedby="second_surname-error"
              ref={secSurnameRef}
            />
          </div>

          <div className="w-full h-full">
            <label className="text-sm font-medium" htmlFor="rut">
              <span className="block text-white">RUT</span>
              {actionData?.errors?.rut && (
                <span className="block pt-1 text-red-700" id="rut-error">
                  {actionData?.errors?.rut}
                </span>
              )}
            </label>
            <input
              className="w-full rounded border border-red-500 px-2 py-1 text-lg"
              type="text"
              name="rut"
              id="rut"
              placeholder="Ej: 12.345.678-9"
              required
              aria-invalid={actionData?.errors?.rut ? true : undefined}
              aria-describedby="rut-error"
              ref={rutRef}
            />
          </div>
          
          <div className="w-full h-full">
            <label className="text-sm font-medium" htmlFor="phone">
              <span className="block text-white">Teléfono</span>
              {actionData?.errors?.phone && (
                <span className="block pt-1 text-red-700" id="phone-error">
                  {actionData?.errors?.phone}
                </span>
              )}
            </label>
            <input
              className="w-full rounded border border-red-500 px-2 py-1 text-lg"
              type="text"
              name="phone"
              id="phone"    
              placeholder="Ej: 912345678"        
              required
              aria-invalid={actionData?.errors?.phone ? true : undefined}
              aria-describedby="phone-error"
              ref={phoneRef}
            />
          </div>

          <div className="w-full h-full">
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

          <div className="w-full h-full">
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
            id="btnRegistrar"
            className="w-full rounded bg-red-500  py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"            
            type="submit"
            disabled={busy}>
            {busy? (<p>Registrando Usuario...</p>) : <p>Registrar Usuario</p>}
          </button>          
          <div className="w-full h-full items-center justify-center">
            <label className="text-sm font-medium" htmlFor="name">
              {!actionData && (
                <span className="block text-white text-center text-md" id="user-error">&nbsp;</span>
              )}     
              {!actionData?.success?.user && (
                <span className="block text-red-700 text-center text-md font-weight-bold" id="user-error">
                  <b>{actionData?.errors?.user}</b>
                </span>
              )}
              {actionData?.success?.user && (
                <span className="block text-white text-center text-md font-weight-bold" id="user-error">
                  <b>{actionData?.errors?.user}</b>
                </span>
              )}
            </label>
          </div>            
          <input type="hidden" name="redirectTo" value={redirectTo} />
          {/*<div className="flex items-center justify-center">
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
          </div>*/}
          <div className="flex w-full h-full items-center justify-center">                      
            <Link
              to="/"
              className="flex justify-center space-y-6 w-full rounded bg-gray-500 py-2 px-4 text-white text-center hover:bg-gray-600 focus:bg-gray-400"
            >
              Volver
            </Link>          
          </div>               
        </Form>
      </div>
    </div>
  );
}

