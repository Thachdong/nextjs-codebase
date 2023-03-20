import { Box, Paper } from "@mui/material";
import { useRouter } from "next/router";
import React, { useCallback, useRef, useState } from "react";
import { Item, Menu } from "react-contexify";
import { useMutation, useQuery } from "react-query";
import { preQuote } from "src/api";
import {
  AddButton,
  ContextMenuWrapper,
  DataTable,
  DropdownButton,
  FilterButton,
  generatePaginationProps,
  RefreshButton,
  SearchBox,
  StatisticButton,
} from "~modules-core/components";
import { defaultPagination, quoteStatus } from "~modules-core/constance";
import { usePathBaseFilter } from "~modules-core/customHooks";
import { toast } from "~modules-core/toast";
import { ViewListProductDrawer } from "~modules-dashboard/components";
import { TGridColDef } from "~types/data-grid";
import { quoteListColumns } from "./data";

export const QuoteListPage = () => {
  const router = useRouter();

  const { query } = router;

  const [pagination, setPagination] = useState(defaultPagination);

  const defaultValue = useRef<any>();

  usePathBaseFilter(pagination);

  // DATA FETCHING
  const { data, isLoading, isFetching, refetch } = useQuery(
    [
      "preQuoteList",
      "loading",
      {
        ...pagination,
        ...query,
      },
    ],
    () =>
      preQuote
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

  // METHODS
  const muatateCancel = useMutation((id: string) => preQuote.cancel(id), {
    onSuccess: (data) => {
      toast.success(data?.resultMessage);

      refetch();
    },
  });

  const handleCancel = useCallback(async () => {
    const { id, preQuoteCode } = defaultValue.current || {};

    if (!id) {
      toast.error("Có lỗi xãy ra, vui lòng thử lại!");

      return;
    }

    if (confirm("Xác nhận hủy báo giá " + preQuoteCode)) {
      await muatateCancel.mutateAsync(id);
    }
  }, [defaultValue]);

  const handleRedirect = useCallback(
    (url: string) => {
      const { status } = defaultValue.current || {};

      if (status !== 1) {
        toast.error(
          "Không thể tạo đơn hàng từ trạng thái " + quoteStatus[status]?.label
        );

        return;
      }
      router.push(url);
    },
    [defaultValue.current]
  );

  // DATA TABLE
  const columns: TGridColDef[] = [
    ...quoteListColumns,
    {
      field: "action",
      headerName: "",
      align: "center",
      width: 50,
      renderCell: ({ row }) => (
        <DropdownButton
          id={row?.id}
          items={[
            {
              action: () =>
                router.push(`quote-detail?id=${defaultValue.current?.id}`),
              label: "Nội dung chi tiết",
            },
            {
              action: () => handleRedirect("/dashboard/orders/order-request"),
              label: "Tạo đơn đặt hàng",
              // disabled: defaultValue.current?.status !== 1,
            },
            {
              action: handleCancel,
              label: "Hủy đơn báo giá",
            },
          ]}
        />
      ),
    },
  ];

  const contextMenu = (
    <Menu className="p-0" id="quote-request_table_menu">
      <Item
        id="view"
        onClick={() =>
          router.push(`quote-detail?id=${defaultValue.current?.id}`)
        }
      >
        Nội dung chi tiết
      </Item>

      <Item
        id="note"
        onClick={() => handleRedirect("/dashboard/orders/order-request")}
      >
        Tạo đơn đặt hàng
      </Item>

      <Item id="cancel" onClick={handleCancel}>
        Hủy đơn báo giá
      </Item>
    </Menu>
  );

  const paginationProps = generatePaginationProps(pagination, setPagination);

  const onMouseEnterRow = (e: React.MouseEvent<HTMLElement>) => {
    const id = e.currentTarget.dataset.id;

    const currentRow = data?.items.find((item: any) => item.id === id);

    defaultValue.current = currentRow;
  };

  const [Open, setOpen] = useState<boolean>(false);
  const dataViewDetail = useRef<any>();
  const handleViewProduct = async (e: React.MouseEvent<HTMLElement>) => {
    const id: any = e.currentTarget.dataset.id;
    const currentRow = await preQuote.getPreQuoteDetail(id).then((res) => {
      return res.data;
    });

    dataViewDetail.current = { ...currentRow, id: id };
    setOpen(true);
  };

  return (
    <>
      <Paper className="bgContainer">
        <Box className="flex justify-between">
          <Box className="flex items-center w-3/5 mb-3 gap-3">
            <AddButton onClick={() => router.push("quote-detail")}>
              Tạo báo giá
            </AddButton>

            <SearchBox label="Nhập mã đơn Y/C, mã KH, tên KH" />
          </Box>
          <Box className="flex gap-2">
            <FilterButton listFilterKey={[]} />
            <RefreshButton onClick={() => refetch()} />
          </Box>
        </Box>

        <ContextMenuWrapper
          menuId="quote-request_table_menu"
          menuComponent={contextMenu}
        >
          <DataTable
            rows={data?.items as []}
            columns={columns}
            gridProps={{
              loading: isLoading || isFetching,
              ...paginationProps,
            }}
            getRowClassName={({ id }) =>
              dataViewDetail?.current?.id == id && Open ? "!bg-[#fde9e9]" : ""
            }
            componentsProps={{
              row: {
                onMouseEnter: onMouseEnterRow,
                onDoubleClick: handleViewProduct,
              },
            }}
          />
        </ContextMenuWrapper>
        <ViewListProductDrawer
          Open={Open}
          onClose={() => setOpen(false)}
          data={dataViewDetail?.current?.preQuoteDetailView}
        />
      </Paper>
    </>
  );
};
