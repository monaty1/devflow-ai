"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  SortDescriptor,
} from "@heroui/table";
import {
  Input,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Pagination } from "@heroui/pagination";
import type { Selection } from "@heroui/react";
import {
  ChevronDown,
  Plus,
  Columns,
} from "lucide-react";
import { Button } from "./button";
import { useTranslation } from "@/hooks/use-translation";

export interface ColumnConfig {
  name: string;
  uid: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnConfig[];
  data: T[];
  filterField: string;
  statusOptions?: { name: string; uid: string }[];
  initialVisibleColumns?: string[];
  renderCell: (item: T, columnKey: React.Key) => React.ReactNode;
  onAdd?: () => void;
  emptyContent?: string;
  placeholder?: string;
  ariaLabel?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  filterField,
  statusOptions,
  initialVisibleColumns,
  renderCell,
  onAdd,
  emptyContent,
  placeholder,
  ariaLabel,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(initialVisibleColumns || columns.map(c => c.uid))
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: columns[0]?.uid ?? "",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    const visibleSet = visibleColumns as Set<string>;
    return columns.filter((column) => visibleSet.has(column.uid));
  }, [visibleColumns, columns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...data];

    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) => {
        const val = filterField.split('.').reduce((obj: Record<string, unknown>, key: string) => (obj?.[key] ?? {}) as Record<string, unknown>, item as unknown as Record<string, unknown>);
        return String(val || "").toLowerCase().includes(filterValue.toLowerCase());
      });
    }
    if (statusOptions && statusFilter !== "all" && (statusFilter as Set<string>).size !== statusOptions.length) {
      const filterSet = statusFilter as Set<string>;
      filteredData = filteredData.filter((item) =>
        filterSet.has(((item as unknown as Record<string, string>)["status"]) ?? "")
      );
    }

    return filteredData;
  }, [data, filterValue, statusFilter, filterField, statusOptions, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = sortDescriptor.column?.toString().split('.').reduce((obj: Record<string, unknown>, key: string) => (obj?.[key] ?? {}) as Record<string, unknown>, a as unknown as Record<string, unknown>) as unknown as string | number;
      const second = sortDescriptor.column?.toString().split('.').reduce((obj: Record<string, unknown>, key: string) => (obj?.[key] ?? {}) as Record<string, unknown>, b as unknown as Record<string, unknown>) as unknown as string | number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            className="w-full sm:max-w-[44%]"
            placeholder={placeholder ?? t("tools.search")}
            value={filterValue}
            onChange={(e) => onSearchChange(e.target.value)}
            variant="primary"
          />
          <div className="flex gap-3">
            {statusOptions && (
              <Dropdown>
                <DropdownTrigger className="hidden sm:flex">
                  <Button variant="ghost" className="gap-2">
                    {t("table.status")}
                    <ChevronDown className="text-small" aria-hidden="true" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label={t("table.status")}
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={setStatusFilter}
                >
                  {statusOptions.map((status) => (
                    <DropdownItem key={status.uid} className="capitalize">
                      {status.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            )}
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button variant="ghost" className="gap-2">
                  {t("table.columns")}
                  <Columns className="size-4" aria-hidden="true" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label={t("table.columns")}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            {onAdd && (
              <Button variant="primary" className="gap-2" onPress={onAdd}>
                <Plus className="size-4" aria-hidden="true" />
                {t("table.addNew")}
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">{t("table.totalItems", { count: data.length })}</span>
          <label className="flex items-center text-default-400 text-small">
            {t("table.rowsPerPage")}
            <select
              className="bg-transparent outline-none text-default-400 text-small cursor-pointer ml-1"
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, statusFilter, visibleColumns, data.length, onSearchChange, statusOptions, columns, onAdd, rowsPerPage, placeholder, t]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? t("table.allSelected")
            : t("table.selectedOf", { selected: (selectedKeys as Set<string>).size, total: filteredItems.length })}
        </span>
        <Pagination
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} size="sm" variant="ghost" onPress={() => setPage(p => Math.max(1, p - 1))}>
            {t("table.previous")}
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="ghost" onPress={() => setPage(p => Math.min(pages, p + 1))}>
            {t("table.next")}
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, filteredItems.length, page, pages, t]);

  return (
    <Table
      isHeaderSticky
      aria-label={ariaLabel ?? t("table.ariaLabel")}
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[500px] border border-divider shadow-sm rounded-2xl bg-content1",
        th: "bg-default-100 text-default-600 font-bold text-tiny uppercase border-b border-divider",
        td: "py-3 border-b border-divider/50 last:border-none",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column: ColumnConfig) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable ?? false}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={emptyContent ?? t("table.noItems")} items={sortedItems}>
        {(item: T) => (
          <TableRow key={item.id}>
            {(columnKey: React.Key) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
