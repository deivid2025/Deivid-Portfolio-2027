"use client";

import * as React from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Generic structured editor for an array of {key: value} objects      */
/* ------------------------------------------------------------------ */

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  span?: 1 | 2;
}

interface StructuredListEditorProps {
  fields: FieldDef[];
  value: Array<Record<string, string>>;
  onChange: (next: Array<Record<string, string>>) => void;
  itemLabel: string;
  emptyItem?: Record<string, string>;
}

export function StructuredListEditor({
  fields,
  value,
  onChange,
  itemLabel,
  emptyItem,
}: StructuredListEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const update = (i: number, key: string, v: string) => {
    onChange(value.map((row, idx) => (idx === i ? { ...row, [key]: v } : row)));
  };

  const add = () => {
    const blank =
      emptyItem ?? fields.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});
    onChange([...value, blank]);
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No hay {itemLabel.toLowerCase()}s. Agregá una con el botón.
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={value.map((_, i) => String(i))}
          strategy={verticalListSortingStrategy}
        >
          {value.map((row, i) => (
            <SortableRow
              key={i}
              id={String(i)}
              index={i}
              fields={fields}
              row={row}
              itemLabel={itemLabel}
              onUpdate={(k, v) => update(i, k, v)}
              onRemove={() => remove(i)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-full rounded-lg border-dashed text-xs"
        onClick={add}
      >
        <Plus className="mr-1.5 h-3 w-3" />
        Agregar {itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}

function SortableRow({
  id,
  index,
  fields,
  row,
  itemLabel,
  onUpdate,
  onRemove,
}: {
  id: string;
  index: number;
  fields: FieldDef[];
  row: Record<string, string>;
  itemLabel: string;
  onUpdate: (key: string, value: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border/60 bg-background/60 p-3",
        isDragging && "z-50 border-primary/60 shadow-lg opacity-90",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
          aria-label={`Arrastrar ${itemLabel} ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {itemLabel} {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Borrar ${itemLabel} ${index + 1}`}
          className="ml-auto h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {fields.map((f) => (
          <div
            key={f.key}
            className={cn("space-y-1", f.span === 2 && "sm:col-span-2")}
          >
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {f.label}
            </Label>
            {f.type === "select" ? (
              <Select
                value={row[f.key] ?? ""}
                onValueChange={(v) => onUpdate(f.key, v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={f.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {f.options?.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={row[f.key] ?? ""}
                onChange={(e) => onUpdate(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="h-8 text-xs"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* String list editor (for highlights: array of strings)               */
/* ------------------------------------------------------------------ */

export function StringListEditor({
  value,
  onChange,
  itemLabel = "Item",
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  itemLabel?: string;
  placeholder?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const update = (i: number, v: string) => {
    onChange(value.map((s, idx) => (idx === i ? v : s)));
  };
  const add = () => onChange([...value, ""]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No hay {itemLabel.toLowerCase()}s.
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={value.map((_, i) => String(i))}
          strategy={verticalListSortingStrategy}
        >
          {value.map((s, i) => (
            <SortableStringRow
              key={i}
              id={String(i)}
              index={i}
              value={s}
              itemLabel={itemLabel}
              placeholder={placeholder}
              onUpdate={(v) => update(i, v)}
              onRemove={() => remove(i)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-full rounded-lg border-dashed text-xs"
        onClick={add}
      >
        <Plus className="mr-1.5 h-3 w-3" />
        Agregar {itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}

function SortableStringRow({
  id,
  index,
  value,
  itemLabel,
  placeholder,
  onUpdate,
  onRemove,
}: {
  id: string;
  index: number;
  value: string;
  itemLabel: string;
  placeholder?: string;
  onUpdate: (v: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 p-1.5",
        isDragging && "z-50 border-primary/60 shadow-lg opacity-90",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none px-1 text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
        aria-label={`Arrastrar ${itemLabel} ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <Input
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={placeholder}
        className="h-8 border-0 bg-transparent text-xs focus-visible:ring-0"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Borrar ${itemLabel} ${index + 1}`}
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
