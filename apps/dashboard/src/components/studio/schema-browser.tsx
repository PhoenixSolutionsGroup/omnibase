"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lock, LockOpen } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SchemaBrowserProps {
  schemas: Record<string, any[]>; // schemaName -> definitions[]
  onSelectTable: (tableName: string, schemaName: string) => void;
  selectedTable: string | null; // format: "schema.table"
}

export function SchemaBrowser({
  schemas,
  onSelectTable,
  selectedTable,
}: SchemaBrowserProps) {
  const schemaNames = Object.keys(schemas);
  const defaultSchema = schemaNames.includes("public") ? "public" : schemaNames[0] || "";
  const [selectedSchema, setSelectedSchema] = useState(defaultSchema);

  // Update selected schema when schemas change
  useEffect(() => {
    if (!schemaNames.includes(selectedSchema)) {
      setSelectedSchema(schemaNames.includes("public") ? "public" : schemaNames[0] || "");
    }
  }, [schemas, schemaNames, selectedSchema]);

  const tables = schemas[selectedSchema] || [];

  return (
    <div className="flex h-full flex-col bg-muted/10" data-testid="schema-browser">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Explorer</h2>
        <Select value={selectedSchema} onValueChange={setSelectedSchema}>
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Select schema" />
          </SelectTrigger>
          <SelectContent>
            {schemaNames.map((schema) => (
              <SelectItem key={schema} value={schema}>
                {schema}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1" data-testid={`schema-group-${selectedSchema}`}>
          {tables.map((table) => (
            <Button
              key={table.name}
              variant={selectedTable === `${selectedSchema}.${table.name}` ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start h-8 font-normal",
                selectedTable === `${selectedSchema}.${table.name}` && "bg-secondary text-secondary-foreground"
              )}
              onClick={() => onSelectTable(table.name, selectedSchema)}
              data-testid={`table-item-${selectedSchema}-${table.name}`}
            >
              {table.hasRlsPolicies ? (
                <Lock className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <LockOpen className="mr-2 h-4 w-4 text-yellow-500" />
              )}
              <span className="truncate">{table.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
