import { Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="fixed inset-0">
        <img
          className="h-full w-full object-cover"
          src="https://raw.githubusercontent.com/Gonzalox2/boxsanfelipe-sitio/2e5fabeecd10995ceee88591e649cfa2683167d1/app/images/Box_Background.jpg"                
          alt="Box Sanfelipe, zona interior"
        />
        <div className="absolute inset-0 bg-[color:rgba(0,0,0,0.5)] mix-blend-multiply" />
      </div>
      <div className="absolute sm:pb-16 sm:pt-8">
        <div className="mx-auto sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">            
            <div className="lg:pb-18 relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-red-500 drop-shadow-md">
                  BOX San Felipe
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                Centro de entrenamiento funcional para TOD@S.<br/>
                Ubicados en Merced 591 (Ex 302), San Felipe.              
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                {user ? (
                  <Link
                    to="/notes"
                    className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-violet-700 shadow-sm hover:bg-violet-50 sm:px-8"
                  >
                    View Notes for {user.email}
                  </Link>
                ) : (
                  <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                    <Link
                      to="/join"
                      className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-red-700 shadow-sm hover:bg-red-50 sm:px-8"
                    >
                      Registrarse
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center rounded-md bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600  "
                    >
                      Iniciar Sesión
                    </Link>
                  </div>
                )}
              </div>
              <div>
                <img
                  src="https://raw.githubusercontent.com/Gonzalox2/boxsanfelipe-sitio/main/app/images/Logo_01.png"
                  alt="Logo Box"
                  className="mx-auto mt-16 w-full max-w-[12rem] md:max-w-[16rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
