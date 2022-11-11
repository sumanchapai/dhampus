import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 my-8 md:my-12 max-w-lg mx-auto">
      <h1 className="text-3xl lg:text-4xl pl-2 text-gray-800 rounded inline-block px-8">
        Page not found{" "}
      </h1>
      <div className="mt-8">
        <Link href="/">
          <span className="text-blue-600 text-lg">&larr; Go Home</span>
        </Link>
      </div>
    </div>
  );
}
