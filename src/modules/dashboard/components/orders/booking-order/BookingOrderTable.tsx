import { Box, Paper } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useRef, useState } from "react";
import { Item, Menu } from "react-contexify";
import { useMutation, useQuery } from "react-query";
import { mainOrder } from "src/api";
import {
  AddButton,
  ContextMenuWrapper,
  DataTable,
  DropdownButton,
  generatePaginationProps,
} from "~modules-core/components";
import { defaultPagination } from "~modules-core/constance";
import { usePathBaseFilter } from "~modules-core/customHooks";
import { toast } from "~modules-core/toast";
import { orderColumns } from "~modules-dashboard/pages/orders/booking-order/orderColumns";
import { TGridColDef } from "~types/data-grid";

export const BookingOrderTable: React.FC = () => {
  const [pagination, setPagination] = useState(defaultPagination);

  const router = useRouter();

  const { query } = router;

  const defaultValue = useRef<any>();

  usePathBaseFilter(pagination);

  // DATA FETCHING
  const { data, isLoading, isFetching, refetch } = useQuery(
    [
      "mainOrders",
      "loading",
      {
        ...pagination,
        ...query,
      },
    ],
    () =>
      mainOrder
        .getList({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          ...query,
        })
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        setPagination({ ...pagination, total: data.totalItem });
      },
    }
  );

  // DATA TABLE
  const columns: TGridColDef[] = [
    ...orderColumns,
    {
      field: "action",
      headerName: "",
      width: 50,
      renderCell: ({ row }) => (
        <DropdownButton
          id={row?.id as string}
          items={[
            {
              action: () =>
                router.push({
                  pathname: "/dashboard/orders/order-detail/",
                  query: { id: row?.id },
                }),
              label: "Thông tin chi tiết",
            },
            {
              action: handleDelete,
              label: "Xóa",
            },
          ]}
        />
      ),
    },
  ];

  const paginationProps = generatePaginationProps(pagination, setPagination);

  const onMouseEnterRow = (e: React.MouseEvent<HTMLElement>) => {
    const id = e.currentTarget.dataset.id;

    const currentRow = data?.items.find((item: any) => item.id === id);

    defaultValue.current = currentRow;
  };

  // METHODS
  const mutateDelete = useMutation((id: string) => mainOrder.delete(id), {
    onSuccess: (data: any) => {
      toast.success(data?.resultMessage);

      refetch();
    },
  });

  const handleDelete = useCallback(async () => {
    const { id, mainOrderCode } = defaultValue.current || {};

    if (confirm("Xác nhận xóa đơn đặt hàng " + mainOrderCode)) {
      await mutateDelete.mutateAsync(id as string);
    }
  }, [defaultValue]);

  return (
    <Paper className="bgContainer p-2 shadow">
      <Box className="flex gap-4 items-center mb-2">
        <Box>
          <AddButton
            variant="contained"
            onClick={() => router.push("/dashboard/orders/order-detail")}
          >
            TẠO MỚI ĐƠN ĐẶT HÀNG
          </AddButton>
        </Box>
      </Box>
      <ContextMenuWrapper
        menuId="order_request_table_menu"
        menuComponent={
          <Menu className="p-0" id="order_request_table_menu">
            <Item
              id="view-order"
              onClick={() =>
                router.push({
                  pathname: "/dashboard/orders/order-detail/",
                  query: { id: defaultValue.current?.id },
                })
              }
            >
              Xem chi tiết
            </Item>
            <Item id="delete-order" onClick={handleDelete}>
              Xóa
            </Item>
          </Menu>
        }
      >
        <DataTable
          rows={data?.items as []}
          columns={columns}
          gridProps={{
            loading: isLoading || isFetching,
            ...paginationProps,
          }}
          componentsProps={{
            row: {
              onMouseEnter: onMouseEnterRow,
            },
          }}
        />
      </ContextMenuWrapper>
    </Paper>
  );
};
