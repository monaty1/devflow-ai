"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Selection,
  SortDescriptor,
} from "@heroui/react";
import { 
  Search, 
  ChevronDown, 
  Plus, 
  Columns,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  filterField,
  statusOptions,
  initialVisibleColumns,
  renderCell,
  onAdd,
  emptyContent = "No items found",
}: DataTableProps<T>) {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(initialVisibleColumns || columns.map(c => c.uid))
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: columns[0]?.uid,
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns, columns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...data];

    if (hasSearchFilter) {
      filteredData = filteredData.filter((item: any) => {
        const val = filterField.split('.').reduce((obj, key) => obj?.[key], item);
        return String(val || "").toLowerCase().includes(filterValue.toLowerCase());
      });
    }
    if (statusOptions && statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredData = filteredData.filter((item: any) =>
        Array.from(statusFilter).includes(item.status)
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
    return [...items].sort((a: any, b: any) => {
      const first = sortDescriptor.column?.toString().split('.').reduce((obj, key) => obj?.[key], a);
      const second = sortDescriptor.column?.toString().split('.').reduce((obj, key) => obj?.[key], b);
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
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={`Search...`}
            startContent={<Search className="size-4 text-default-300" />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
            variant="bordered"
          />
          <div className="flex gap-3">
            {statusOptions && (
              <Dropdown>
                <DropdownTrigger className="hidden sm:flex">
                  <Button endContent={<ChevronDown className="text-small" />} variant="flat">
                    Status
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
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
                <Button endContent={<Columns className="size-4" />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
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
              <Button color="primary" endContent={<Plus className="size-4" />} onPress={onAdd}>
                Add New
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {data.length} items</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
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
  }, [filterValue, statusFilter, visibleColumns, data.length, onSearchChange, statusOptions, columns, onAdd, rowsPerPage]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={() => setPage(p => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={() => setPage(p => Math.min(pages, p + 1))}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, filteredItems.length, page, pages]);

  return (
    <Table
      isHeaderSticky
      aria-label="Data Table"
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
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={emptyContent} items={sortedItems}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
