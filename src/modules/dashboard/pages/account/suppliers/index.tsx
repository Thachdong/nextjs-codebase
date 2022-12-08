import { Paper } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import moment from "moment";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { suppliers, TSupplier } from "src/api";
import {
  AddButton,
  DataTable,
  DeleteButton,
  generatePaginationProps,
  SearchBox,
  ViewButton,
} from "~modules-core/components";
import { defaultPagination } from "~modules-core/constance";
import { toast } from "~modules-core/toast";
import { SupplierDialog } from "~modules-dashboard/components/account";
import { TDefaultDialogState } from "~types/dialog";

export const SuppliersPage = () => {
  const [pagination, setPagination] = useState(defaultPagination);

  const [dialog, setDialog] = useState<TDefaultDialogState>({ open: false });

  const [defaultValue, setDefaultValue] = useState<TSupplier>();

  const router = useRouter();

  const { query } = router;

  // PUSH PAGINATION QUERY
  useEffect(() => {
    const initQuery = {
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    router.push({ query: initQuery, ...query });
  }, [pagination]);

  // DIALOG METHODS
  const onDialogClose = useCallback(() => {
    setDialog({ open: false });
  }, []);

  // DATA FETCHING
  const { data, isLoading, isFetching, refetch } = useQuery(
    [
      "Suppliers",
      "loading",
      {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        query,
      },
    ],
    () =>
      suppliers
        .getList({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          query,
        })
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        setPagination({ ...pagination, total: data.totalItem });
      },
    }
  );

  // DATA TABLE
  const onUpdate = useCallback(
    (row: TSupplier) => {
      setDialog({ open: true, type: "View" });

      setDefaultValue(row);
    },
    [setDefaultValue]
  );

  const mutateDelete = useMutation((id: string) => suppliers.delete(id), {
    onError: (error: any) => {
      toast.error(error?.resultMessage);
    },
    onSuccess: (data) => {
      toast.success(data.resultMessage);

      refetch();
    },
  });

  const onDelete = useCallback(async (supplier: TSupplier) => {
    if (confirm("Xác nhận nhân viên: " + supplier.supplierName)) {
      await mutateDelete.mutateAsync(supplier.id as string);
    }
  }, []);

  const columns: GridColDef<TSupplier>[] = [
    {
      field: "created",
      headerName: "Ngày tạo",
      type: "dateTime",
      width: 125,
      renderCell: (params) =>
        params.row.created
          ? moment(params.row.created).format("DD/MM/YYYY")
          : "__",
    },
    { field: "supplierCode", headerName: "Mã NCC", flex: 1 },
    { field: "supplierName", headerName: "Tên NCC", flex: 1 },
    { field: "curatorName", headerName: "Tên người liên hệ", flex: 1 },
    { field: "curatorPositionName", headerName: "Chức vụ", flex: 1 },
    { field: "curatorPhone", headerName: "Số điện thoại", flex: 1 },
    { field: "curatorEmail", headerName: "Email", flex: 1 },
    { field: "CreatedBy", headerName: "Người tạo", flex: 1 },
    {
      field: "action",
      headerName: "Thao tác",
      renderCell: (record) => (
        <>
          <ViewButton
            className="min-h-[40px] min-w-[40px]"
            onClick={() => onUpdate(record.row)}
          />
          <DeleteButton
            onClick={() => onDelete(record.row)}
            className="min-h-[40px] min-w-[40px]"
          />
        </>
      ),
    },
  ];

  const paginationProps = generatePaginationProps(pagination, setPagination);

  return (
    <Paper className="bgContainer">
      <div className="flex mb-3">
        <div className="w-1/2">
          <SearchBox />
        </div>

        <div className="w-1/2 flex items-center justify-end">
          <AddButton
            variant="contained"
            className="mr-3"
            onClick={() => setDialog({ open: true, type: "Add" })}
          >
            Tạo nhà cung cấp
          </AddButton>
        </div>
      </div>

      <DataTable
        rows={data?.items}
        columns={columns}
        gridProps={{
          loading: isLoading || isFetching,
          ...paginationProps,
        }}
      />

      <SupplierDialog
        onClose={onDialogClose}
        open={dialog.open}
        type={dialog.type}
        refetch={refetch}
        defaultValue={defaultValue as any}
      />
    </Paper>
  );
};
