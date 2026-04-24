import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { BrandLogo } from "@/components/app/BrandLogo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <BrandLogo size="lg" priority />
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <SignIn
            routing="path"
            path="/auth/login"
            signUpUrl="/auth/signup"
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                cardBox: "shadow-none border-0 w-full",
                card: "shadow-none border-0 w-full bg-transparent",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
