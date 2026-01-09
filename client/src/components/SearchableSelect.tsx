import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

interface Option {
  id: string;
  code: string;
  description: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label: string;
  placeholder?: string;
  apiEndpoint: string;
  disabled?: boolean;
  required?: boolean;
  isLoading?: boolean;
  onOptionAdded?: () => void;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  label,
  placeholder = "Seleccionar...",
  apiEndpoint,
  disabled = false,
  required = false,
  isLoading = false,
  onOptionAdded,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Match by description value (human-readable) instead of UUID
  const selectedOption = options.find((option) => option.description === value);

  const createMutation = useMutation({
    mutationFn: async (data: { code: string; description: string }) => {
      const response = await apiRequest("POST", apiEndpoint, data);
      return response.json();
    },
    onSuccess: (newOption) => {
      setDialogOpen(false);
      setNewCode("");
      setNewDescription("");
      if (newOption?.description) {
        // Store description (human-readable value) instead of UUID
        onChange(newOption.description);
      }
      onOptionAdded?.();
    },
  });

  const handleAddNew = () => {
    setOpen(false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (newCode.trim() && newDescription.trim()) {
      createMutation.mutate({
        code: newCode.trim(),
        description: newDescription.trim(),
      });
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setNewCode("");
    setNewDescription("");
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className="w-full justify-between font-normal"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                A carregar...
              </span>
            ) : selectedOption ? (
              `${selectedOption.code} - ${selectedOption.description}`
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Pesquisar..." />
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={`${option.code} ${option.description}`}
                    onSelect={() => {
                      // Store description (human-readable value) instead of UUID
                      onChange(option.description === value ? "" : option.description);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.description ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.code} - {option.description}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={handleAddNew} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar novo
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar {label}</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para adicionar uma nova opção.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Ex: 01"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Ex: Embalagem"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!newCode.trim() || !newDescription.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
