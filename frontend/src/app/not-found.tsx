import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center px-6">
          <span className="text-[120px] md:text-[180px] font-bold leading-none bg-gradient-to-b from-neutral-400 to-neutral-200 dark:from-neutral-600 dark:to-neutral-800 bg-clip-text text-transparent select-none">
            404
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-neutral-100">
            Page not found
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-10">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 text-base font-semibold hover:opacity-90 transition-opacity"
          >
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
