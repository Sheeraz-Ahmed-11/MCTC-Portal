import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-svh bg-[#0f0f0f] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="text-sm text-[#c45050] hover:underline">
          ← Back to sign in
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          Privacy policy content will be published here. Contact your MCTC
          administrator if you have questions about how your data is handled.
        </p>
      </div>
    </div>
  );
}
