import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter, X, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export interface FilterItem {
    id: string;
    column: string;
    operator: string;
    value: string;
}

interface FilterBuilderProps {
    columns: any[];
    onApply: (filters: FilterItem[]) => void;
}

export function FilterBuilder({ columns, onApply }: FilterBuilderProps) {
    const [filters, setFilters] = useState<FilterItem[]>([]);
    const [open, setOpen] = useState(false);

    const addFilter = () => {
        setFilters([...filters, { id: Math.random().toString(), column: columns[0]?.name || '', operator: 'eq', value: '' }]);
    };

    const removeFilter = (id: string) => {
        setFilters(filters.filter(f => f.id !== id));
    };

    const updateFilter = (id: string, field: keyof FilterItem, value: string) => {
        setFilters(filters.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const handleApply = () => {
        onApply(filters);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant={filters.length > 0 ? "secondary" : "outline"} size="sm" className="gap-1" data-testid="filter-builder">
                    <Filter className="h-4 w-4" /> 
                    {filters.length > 0 ? `Filters (${filters.length})` : "Filter"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="start">
                <div className="space-y-4">
                    <h4 className="font-medium leading-none">Filters</h4>
                    <div className="space-y-2">
                        {filters.map((filter) => (
                            <div key={filter.id} className="flex gap-2 items-center">
                                <Select value={filter.column} onValueChange={(v) => updateFilter(filter.id, 'column', v)}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={filter.operator} onValueChange={(v) => updateFilter(filter.id, 'operator', v)}>
                                    <SelectTrigger className="w-[80px]" data-testid="filter-operator-select">
                                        <SelectValue placeholder="Op" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="eq">=</SelectItem>
                                        <SelectItem value="neq">!=</SelectItem>
                                        <SelectItem value="gt">&gt;</SelectItem>
                                        <SelectItem value="lt">&lt;</SelectItem>
                                        <SelectItem value="gte">&gt;=</SelectItem>
                                        <SelectItem value="lte">&lt;=</SelectItem>
                                        <SelectItem value="ilike">like</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input 
                                    className="flex-1 h-9" 
                                    placeholder="Value" 
                                    value={filter.value} 
                                    onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                />
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFilter(filter.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-1 rounded" data-testid="filter-group-toggle">
                        <span>Match:</span>
                        <span className="font-bold text-primary">AND</span>
                        <span className="text-muted-foreground/50">OR</span>
                    </div>
                    <div className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={addFilter} className="gap-1" data-testid="add-filter-button">
                            <Plus className="h-3 w-3" /> Add Filter
                        </Button>
                        <Button size="sm" onClick={handleApply} data-testid="apply-filters-button">Apply</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
