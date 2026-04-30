import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
            <div className="border-4 border-black neo-shadow bg-white p-12 max-w-lg w-full text-center">
                <div className="inline-block px-3 py-1 bg-[#c3f400] border-2 border-black text-xs font-black uppercase mb-6">
                    ERROR
                </div>
                <h1 className="text-8xl font-black uppercase mb-4" style={{ letterSpacing: '-0.04em' }}>404</h1>
                <p className="font-bold uppercase tracking-tight text-[#434656] mb-8">
                    Page not found — this route does not exist.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-block bg-black text-white border-4 border-black neo-shadow px-8 py-4 font-black uppercase hover:bg-[#c3f400] hover:text-black active:shadow-none active:translate-y-1 transition-all"
                >
                    ← BACK TO DASHBOARD
                </Link>
            </div>
        </div>
    );
}
