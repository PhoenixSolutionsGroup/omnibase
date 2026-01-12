import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PostgrestClient } from "@supabase/postgrest-js";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateRowDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    columns: any[];
    client: PostgrestClient<any>;
    tableName: string;
    schemaName: string;
    onSuccess: () => void;
}

export function CreateRowDialog({ open, onOpenChange, columns, client, tableName, schemaName, onSuccess }: CreateRowDialogProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Filter out empty strings if they should be null?
            // For now sending as is. PostgREST handles type conversion usually.
            const payload = { ...formData };
            
            // Clean up payload: remove empty strings if type is not text?
            // Actually PostgREST might complain if we send "" for UUID.
            // We should send null or undefined if empty.
            
            Object.keys(payload).forEach(key => {
                if (payload[key] === "") payload[key] = null;
            });

            const { error } = await client.schema(schemaName).from(tableName).insert(payload);
            if (error) throw error;
            toast.success("Row created");
            onSuccess();
            onOpenChange(false);
            setFormData({});
        } catch (e: any) {
            console.error(e);
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (col: string, value: any) => {
        setFormData(prev => ({ ...prev, [col]: value }));
    }

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
            )}
            <div 
                className={cn(
                    "fixed inset-y-0 right-0 z-50 h-full w-full border-l bg-background p-6 shadow-lg transition-transform sm:max-w-sm",
                    open ? "translate-x-0" : "translate-x-full"
                )}
                data-testid="create-row-panel"
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Create New Row</h2>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                            <span className="sr-only">Close</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto py-4" data-testid="create-row-form">
                        <div className="grid gap-4">
                            {columns.map(col => (
                                <div key={col.name} className="grid gap-2">
                                    <Label>{col.name} <span className="text-xs text-muted-foreground">({col.type})</span></Label>
                                    {col.type === 'boolean' ? (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                checked={formData[col.name] || false} 
                                                onCheckedChange={(c) => handleChange(col.name, c)}
                                                id={`create-field-${col.name}`}
                                                data-testid={`create-field-${col.name}`}
                                            />
                                            <label htmlFor={`create-field-${col.name}`} className="text-sm font-medium leading-none">
                                                {col.name}
                                            </label>
                                        </div>
                                    ) : (
                                        <Input 
                                            value={formData[col.name] || ''} 
                                            onChange={e => handleChange(col.name, e.target.value)}
                                            placeholder={col.format || col.type}
                                            data-testid={`create-field-${col.name}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-auto flex justify-end gap-2 pt-4">
                         <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                         <Button onClick={handleSubmit} disabled={loading} data-testid="create-row-submit">Create</Button>
                    </div>
                </div>
            </div>
        </>
    )
}
