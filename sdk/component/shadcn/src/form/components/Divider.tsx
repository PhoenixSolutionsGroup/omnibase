type DividerProps = {
  withText?: boolean;
};

export function Divider({ withText = false }: DividerProps) {
  if (withText) {
    return (
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground font-medium">
            Or continue with
          </span>
        </div>
      </div>
    );
  }

  return <div className="border-t border-border my-6" />;
}
