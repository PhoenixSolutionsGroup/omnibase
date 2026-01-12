"use client";

import { useState, useEffect, useRef } from "react";
import { PostgrestClient } from "@supabase/postgrest-js";
import { Loader2, AlertCircle } from "lucide-react";
import { SchemaBrowser } from "./schema-browser";
import { TableViewer } from "./table-viewer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Project } from "@/app/(dashboard)/(project)/projects/[project_group_id]/[project_branch]/dashboard/project-provisioning-dashboard";
import { fetchProjectSecretKey } from "@/app/(dashboard)/(project)/projects/[project_group_id]/[project_branch]/settings/actions";
import { fetchSchemaInfo } from "@/app/(dashboard)/(project)/projects/[project_group_id]/[project_branch]/studio/actions";

interface StudioProps {
  project: Project;
}

export default function Studio({ project }: StudioProps) {
  const [client, setClient] = useState<PostgrestClient<any> | null>(null);
  const [schemas, setSchemas] = useState<Record<string, any[]>>({});
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);
  const serviceKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (!project.postgrest_url) {
          throw new Error("Missing project PostgREST URL");
        }

        // Fetch decrypted service key if we don't have it yet
        if (!serviceKeyRef.current) {
          try {
            const keyResult = await fetchProjectSecretKey(project.id);
            if (!keyResult.success || !keyResult.serviceKey) {
              throw new Error(
                keyResult.error || "Failed to fetch database service key"
              );
            }
            serviceKeyRef.current = keyResult.serviceKey;
          } catch (error) {
            // Fallback: super_user JWT signed with default dev secret (expires 2125)
            serviceKeyRef.current =
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3VwZXJfdXNlciIsImlhdCI6MTc2ODIwOTQzOCwiZXhwIjo0OTIxODA5NDM4fQ.9UpLESA_Kc_uYwACYz9sxysZNOjAxh-h1BGw6wsZ_i4";
          }
        }

        // Use simulated token for RLS simulation, otherwise use service key
        const token = simulatedToken || serviceKeyRef.current;

        const pgClient = new PostgrestClient(project.postgrest_url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClient(pgClient);

        // Fetch schema info directly from Postgres
        const schemaResult = await fetchSchemaInfo(
          project.project_group_id,
          project.branch_name
        );
        if (!schemaResult.success || !schemaResult.schemas) {
          throw new Error(schemaResult.error || "Failed to fetch schema info");
        }
        setSchemas(schemaResult.schemas);

        // Auto-select first table in public schema (or first available schema)
        const schemaNames = Object.keys(schemaResult.schemas);
        const defaultSchema = schemaNames.includes("public") ? "public" : schemaNames[0];
        if (defaultSchema && schemaResult.schemas[defaultSchema]?.length > 0) {
          setSelectedTable(`${defaultSchema}.${schemaResult.schemas[defaultSchema][0].name}`);
        }

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };
    init();
  }, [project, simulatedToken]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // selectedTable format is "schema.table"
  const [selectedSchema, selectedTableName] = selectedTable?.split(".") ?? [null, null];
  const selectedTableDef = selectedSchema && selectedTableName
    ? schemas[selectedSchema]?.find((t) => t.name === selectedTableName)
    : null;

  const handleSelectTable = (tableName: string, schemaName: string) => {
    setSelectedTable(`${schemaName}.${tableName}`);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-2 flex items-center justify-between bg-background px-4 h-12">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-sm">Database Studio</h1>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r bg-muted/10">
          <SchemaBrowser
            schemas={schemas}
            onSelectTable={handleSelectTable}
            selectedTable={selectedTable}
          />
        </div>
        <div className="flex-1 overflow-hidden bg-background">
          {selectedTableName && client && selectedTableDef ? (
            <TableViewer
              key={selectedTable} // Force remount on table change
              client={client}
              tableName={selectedTableName}
              tableDefinition={selectedTableDef}
              project={project}
              onSimulate={setSimulatedToken}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground bg-muted/5">
              <div className="text-center">
                <DatabaseIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Select a table to view data</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DatabaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
