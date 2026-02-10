import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex items-center justify-center relative">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0" />

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        <div className="text-[120px] sm:text-[160px] font-bold leading-none text-[#262626] select-none">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold -mt-4 mb-4">
          Page not found
        </h1>
        <p className="text-[#737373] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#14F195] to-[#00D18C] text-black font-semibold hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            href="/playground/hello-solana"
            className="px-6 py-3 rounded-xl bg-[#111111] border border-[#262626] text-[#FAFAFA] font-semibold hover:bg-[#1A1A1A] transition-colors"
          >
            Open Playground
          </Link>
        </div>
      </div>
    </div>
  );
}
