"use client";

import { useState } from "react";
import { omnibase } from "../../lib/omnibase";
import { PageHeader } from "./components/PageHeader";
import { StatusMessages } from "./components/StatusMessages";
import { CheckPermissionForm } from "./components/CheckPermissionForm";

export default function PermissionsPage() {
  const [checkNamespace, setCheckNamespace] = useState("Tenant");
  const [checkObject, setCheckObject] = useState("");
  const [checkRelation, setCheckRelation] = useState("");
  const [checkSubjectId, setCheckSubjectId] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<boolean | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCheckPermission = async () => {
    if (!checkNamespace || !checkObject || !checkRelation || !checkSubjectId) {
      setError("Please fill in all fields");
      return;
    }

    setChecking(true);
    setError("");
    setSuccess("");
    setCheckResult(null);

    try {
      const result = await omnibase.permissions.permissions.checkPermission({
        namespace: checkNamespace,
        object: checkObject,
        relation: checkRelation,
        subjectId: checkSubjectId,
      });

      const allowed = result.data.allowed || false;
      setCheckResult(allowed);
      setSuccess(
        allowed
          ? `✅ Permission GRANTED: ${checkSubjectId} CAN ${checkRelation} ${checkNamespace}:${checkObject}`
          : `❌ Permission DENIED: ${checkSubjectId} CANNOT ${checkRelation} ${checkNamespace}:${checkObject}`
      );
    } catch (err: any) {
      setError(`❌ Check failed: ${err.message || "Unknown error"}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔐 Permissions Testing
            </h1>
            <p className="text-gray-600">
              Test permission checking, relationship tuples, and access control
              via Ory Keto
            </p>
          </div>

          <div className="space-y-6">
            <StatusMessages error={error} success={success} />

            <CheckPermissionForm
              namespace={checkNamespace}
              object={checkObject}
              relation={checkRelation}
              subjectId={checkSubjectId}
              isLoading={checking}
              checkResult={checkResult}
              onNamespaceChange={setCheckNamespace}
              onObjectChange={setCheckObject}
              onRelationChange={setCheckRelation}
              onSubjectIdChange={setCheckSubjectId}
              onSubmit={handleCheckPermission}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
