import { signIn, signOut, useSession } from "next-auth/react";

export default function Layout({ children }) {
  return (
    <div className=" px-4 max-w-lg mx-auto flex flex-col min-h-screen justify-between">
      <div className="mt-8 lg:mt-16 ">{children}</div>
      <Footer />
    </div>
  );
}

function Footer() {
  const { data: session } = useSession();
  return (
    <div className="">
      {/* Allow saving to persistent database if users signed in */}
      {/* Guests aren't meant to sign in, only the receptionist.
        The receptionist can get data from guests by having guets to to 
        the same address without signing in */}
      <div className="mt-16">
        <p className="text-sm text-gray-400">Made by dwellers of Annapurna</p>
        <div className="text-sm -mx-4 px-4 py-2 mb-4">
          {session ? (
            <p
              role="button"
              className="hover:text-gray-400 text-gray-600 inline"
              onClick={() => signOut()}
            >
              Logout
            </p>
          ) : (
            <p
              role="button"
              className="hover:text-gray-400 text-gray-600 inline"
              onClick={() => signIn()}
            >
              Admin Login{" "}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
