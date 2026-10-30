import { PulsingDots } from "@/components/plusing-dots";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 h-full">
      <div className="relative isolate col-span-3 bg-foreground md:flex justify-center items-center overflow-hidden hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
        <PulsingDots />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-77.5 w-77.5 rounded-full bg-primary/20 opacity-20 blur-[100px]" />

        <div className="fixed top-0 left-0 z-50 p-6">
          <span className="flex items-center gap-2 text-background font-semibold text-lg">
            <Image
              src="/omnibase-logo.svg"
              alt="Omnibase"
              width={24}
              height={24}
              className="rounded-lg"
              unoptimized
            />
            Omnibase
          </span>
        </div>
        <div className="text-primary-foreground w-2/5 lex flex-col gap-4 relative ">
          <p className="text-9xl absolute -top-9 -left-5 text-primary-foreground/20">
            "
          </p>
          <p className="font-bold text-2xl">
            Launch your app for free in less than 5 minutes. Everything you need
            is already included: real time storage, authentication, permissions
            and billing. No coding required.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center col-span-2">
        <div className="fixed top-0 left-0 z-50 p-6 flex md:hidden">
          <span className="flex items-center gap-2 font-semibold text-lg">
            <Image
              src="/omnibase-logo.svg"
              alt="Omnibase"
              width={24}
              height={24}
              className="rounded-lg"
              unoptimized
            />
            Omnibase
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
