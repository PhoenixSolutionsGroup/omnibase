import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-4 h-full">
      {/* Background image: top half on mobile, left column on desktop */}
      <div className="absolute inset-x-0 top-0 h-1/2 lg:static lg:col-span-2 lg:h-full lg:p-4">
        <div className="relative isolate h-full w-full overflow-hidden rounded-b-xl lg:rounded-2xl">
          <Image
            src="/auth-background.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
          />

          <div className="absolute top-0 left-0 z-10 p-6">
            <span className="flex items-center text-background font-semibold text-lg">
              <Image
                src="/omnibase-logo-transparent.svg"
                alt="Omnibase"
                width={64}
                height={64}
                className="rounded-lg scale-25 -mr-4 block dark:hidden"
                unoptimized
              />
              <Image
                src="/omnibase-logo-transparent-dark.svg"
                alt="Omnibase"
                width={64}
                height={64}
                className="rounded-lg scale-25 -mr-4 hidden dark:block"
                unoptimized
              />
              Omnibase
            </span>
          </div>
        </div>
      </div>

      {/* Content: overlaps the image on mobile */}
      <div className="relative z-10 flex items-center justify-center lg:col-span-2">
        {children}
      </div>
    </div>
  );
}
