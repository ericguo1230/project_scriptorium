import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="font-semibold text-primary">404</p>
        <h1 className="mt-4 text-neutral text-5xl font-semibold tracking-tight sm:text-7xl">
          Page not found
        </h1>
        <div className="mt-6 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
          Sorry, we couldn’t find the page you’re looking for.
        </div>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/" className="btn btn-primary btn-lg">
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
