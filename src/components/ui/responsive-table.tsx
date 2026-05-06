"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableWrapper({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          {children}
        </div>
      </div>
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {children}
      </div>
    </div>
  );
}

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <Table className={cn("w-full", className)}>
      {children}
    </Table>
  );
}

interface ResponsiveTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableHeader({ children, className }: ResponsiveTableHeaderProps) {
  return (
    <TableHeader className={cn("", className)}>
      {children}
    </TableHeader>
  );
}

interface ResponsiveTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableBody({ children, className }: ResponsiveTableBodyProps) {
  return (
    <TableBody className={cn("", className)}>
      {children}
    </TableBody>
  );
}

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ResponsiveTableRow({ children, className, onClick }: ResponsiveTableRowProps) {
  return (
    <TableRow 
      className={cn("", className, onClick && "cursor-pointer hover:bg-muted/50")}
      onClick={onClick}
    >
      {children}
    </TableRow>
  );
}

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function ResponsiveTableCell({ children, className, colSpan }: ResponsiveTableCellProps) {
  return (
    <TableCell className={cn("", className)} colSpan={colSpan}>
      {children}
    </TableCell>
  );
}

interface ResponsiveTableHeadProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function ResponsiveTableHead({ children, className, colSpan }: ResponsiveTableHeadProps) {
  return (
    <TableHead className={cn("", className)} colSpan={colSpan}>
      {children}
    </TableHead>
  );
}

// Mobile Card Component for responsive display
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ children, className, onClick }: MobileCardProps) {
  return (
    <div 
      className={cn(
        "bg-white border rounded-lg p-4 shadow-sm",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface MobileCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardHeader({ children, className }: MobileCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      {children}
    </div>
  );
}

interface MobileCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardContent({ children, className }: MobileCardContentProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

interface MobileCardFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function MobileCardField({ label, value, className }: MobileCardFieldProps) {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// Responsive Pagination Component
interface ResponsivePaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
  className?: string;
}

export function ResponsivePagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
  className
}: ResponsivePaginationProps) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      {/* Mobile: Simple Previous/Next */}
      <div className="flex items-center space-x-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canPrevious}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>

      {/* Desktop: Full pagination */}
      <div className="hidden md:flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canPrevious}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// Responsive Actions Component
interface ResponsiveActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveActions({ children, className }: ResponsiveActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Desktop: Show all actions */}
      <div className="hidden md:flex items-center gap-2">
        {children}
      </div>
      
      {/* Mobile: Show dropdown with actions */}
      <div className="md:hidden">
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}