import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";

interface AcceptInviteFormProps {
  token: string;
  isLoading: boolean;
  onTokenChange: (value: string) => void;
  onSubmit: () => void;
}

export function AcceptInviteForm({
  token,
  isLoading,
  onTokenChange,
  onSubmit,
}: AcceptInviteFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        4. Accept Tenant Invite
      </h2>
      <div className="space-y-4">
        <FormInput
          label="Invite Token"
          value={token}
          onChange={onTokenChange}
          placeholder="inv_abc123xyz..."
        />
        <Button onClick={onSubmit} disabled={isLoading} className="w-full">
          {isLoading ? "Accepting..." : "Accept Invite"}
        </Button>
      </div>
    </div>
  );
}
