"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { fetchRLSPolicies, RLSPolicy } from "@/app/(dashboard)/(project)/projects/[project_id]/[project_branch]/studio/actions";
import { cn } from "@/lib/utils";

interface RLSViewerProps {
    project: {
        project_id: string;
        branch_name: string;
    };
    tableName: string;
    schemaName: string;
    hasRlsPolicies?: boolean;
}

export function RLSViewer({ project, tableName, schemaName, hasRlsPolicies }: RLSViewerProps) {
    const [policies, setPolicies] = useState<RLSPolicy[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        fetchPolicies();
    }, [tableName, schemaName]);

    const fetchPolicies = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchRLSPolicies(
                project.project_id,
                project.branch_name,
                tableName,
                schemaName
            );
            if (!result.success) {
                throw new Error(result.error || "Failed to fetch policies");
            }
            setPolicies(result.policies || []);
        } catch (e: any) {
            console.error("Failed to fetch policies:", e);
            setError(e.message || "Could not fetch policies.");
        } finally {
            setLoading(false);
        }
    };

    if (!hasRlsPolicies && policies.length === 0 && !loading) {
        return null;
    }

    return (
        <div className="border-t bg-muted/5" data-testid="rls-viewer">
            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between h-10 rounded-none px-4"
                onClick={() => setExpanded(!expanded)}
            >
                <span className="font-medium">RLS Policies ({policies.length})</span>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <div className={cn("overflow-hidden transition-all", expanded ? "max-h-[400px]" : "max-h-0")}>
                <div className="p-4 pt-0">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : error ? (
                        <div className="text-center p-4 text-destructive">{error}</div>
                    ) : policies.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">No policies found.</div>
                    ) : (
                        <div className="border rounded-md overflow-auto max-h-[300px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Command</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead>USING</TableHead>
                                        <TableHead>WITH CHECK</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {policies.map((p, i) => (
                                        <TableRow key={i} data-testid={`rls-policy-${p.policyname}`}>
                                            <TableCell className="font-medium">{p.policyname}</TableCell>
                                            <TableCell>{p.cmd}</TableCell>
                                            <TableCell>{Array.isArray(p.roles) ? p.roles.join(', ') : p.roles}</TableCell>
                                            <TableCell className="font-mono text-xs max-w-xs truncate" title={p.qual ?? undefined}>{p.qual}</TableCell>
                                            <TableCell className="font-mono text-xs max-w-xs truncate" title={p.with_check ?? undefined}>{p.with_check}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
