import type { FlowError } from "@ory/client-fetch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export type ErrorFormProps = {
  error: FlowError;
  login_url?: string;
  Header?: React.ReactNode;
};

interface GenericError {
  code?: number;
  message?: string;
  reason?: string;
  status?: string;
}

export function ErrorForm({
  error,
  login_url = "/auth/login",
  Header,
}: ErrorFormProps) {
  const errorDetails = error.error as GenericError | undefined;

  return (
    <div>
      <Card className="w-full max-w-md mx-auto">
        {Header && (
          <CardHeader>
            <CardTitle className="text-center pb-1">{Header}</CardTitle>
          </CardHeader>
        )}

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>
              {errorDetails?.status || "Authentication Error"}
            </AlertTitle>
            <AlertDescription>
              {errorDetails?.message || "An unexpected error occurred."}
            </AlertDescription>
          </Alert>

          {errorDetails?.reason && (
            <p className="text-sm text-muted-foreground">
              {errorDetails.reason}
            </p>
          )}

          <Button asChild className="w-full">
            <a href={login_url}>Back to Login</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
