"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ChildSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: string[];
  className: string;
  sessionLength: number;
  price: number;
  onConfirm: (childName: string) => void;
}

export function ChildSelectDialog({
  open,
  onOpenChange,
  children,
  className,
  sessionLength,
  price,
  onConfirm,
}: ChildSelectDialogProps) {
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  const handleToggle = (child: string) => {
    setSelectedChildren((prev) =>
      prev.includes(child)
        ? prev.filter((c) => c !== child)
        : [...prev, child]
    );
  };

  const handleConfirm = () => {
    if (selectedChildren.length > 0) {
      selectedChildren.forEach(onConfirm);
      setSelectedChildren([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Children for Registration</DialogTitle>
          <DialogDescription>
            Choose one or more children to register for this class session.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Class</label>
            <div className="text-sm text-muted-foreground">{className}</div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Session</label>
            <div className="text-sm text-muted-foreground">
              {sessionLength} week{sessionLength > 1 ? "s" : ""} - ${price.toFixed(2)}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Children</label>
            <div className="flex flex-col gap-2">
              {children.map((child) => (
                <label key={child} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedChildren.includes(child)}
                    onCheckedChange={() => handleToggle(child)}
                    id={`child-checkbox-${child}`}
                  />
                  <span className="text-sm">{child}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedChildren.length === 0}>
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 