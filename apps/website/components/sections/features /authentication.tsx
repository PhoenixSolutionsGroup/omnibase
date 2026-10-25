import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Authentication() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-2 pointer-events-none select-none transition-transform duration-300 group-hover:-translate-y-1 pt-2"
    >
      <Input
        type="text"
        name="demo-email"
        placeholder="omni@gmail.com"
        autoComplete="off"
        tabIndex={-1}
        className="transition-colors group-hover:placeholder:text-primary duration-500"
      />
      <Input
        type="password"
        name="demo-password"
        defaultValue="hello-world"
        autoComplete="new-password"
        tabIndex={-1}
        className="transition-colors group-hover:placeholder:text-primary"
      />
      <div className="flex flex-col gap-2 w-full">
        <Button
          type="button"
          variant="outline"
          tabIndex={-1}
          disabled
          className="flex-1"
        >
          Login with Google
        </Button>
        <Button
          type="button"
          tabIndex={-1}
          disabled
          className="flex-1 bg-black"
        >
          Login
        </Button>
      </div>
    </div>
  );
}
