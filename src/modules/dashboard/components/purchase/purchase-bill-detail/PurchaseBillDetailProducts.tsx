import { Box, List, ListItem, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Item, Menu } from "react-contexify";
import { useFormContext } from "react-hook-form";
import {
  AddButton,
  ContextMenuWrapper,
  DataTable,
  DropdownButton,
} from "~modules-core/components";
import { _format } from "~modules-core/utility/fomat";
import { PurchaseBillDetailProductsDialog } from "~modules-dashboard/components";
import { productColumns } from "~modules-dashboard/pages/purchase/purchase-bill-detail/data";
import { TGridColDef } from "~types/data-grid";
import { TDefaultDialogState } from "~types/dialog";

type TProps = {
  data?: any;
  productList: any[];
};

export const PurchaseBillDetailProducts: React.FC<TProps> = ({
  data,
  productList,
}) => {
  const { id } = useRouter().query;

  const [dialog, setDialog] = useState<TDefaultDialogState>();

  const defaultValue = useRef<any>();

  const { watch, setValue } = useFormContext();

  const products = watch("products");

  const columns: TGridColDef[] = [
    ...productColumns,
    {
      field: "action",
      headerName: "",
      width: 50,
      renderCell: ({ row }) => (
        <DropdownButton
          id={row?.id}
          items={[
            {
              action: () => onOpen("Update"),
              label: "Thông tin chi tiết",
              disabled: !!id,
            },
            {
              action: handleDelete,
              label: "Xóa",
              disabled: !!id,
            },
          ]}
        />
      ),
    },
  ];

  // METHODS
  const onClose = useCallback(() => {
    setDialog({ open: false });
  }, []);

  const onOpen = useCallback((type: string) => {
    setDialog({ open: true, type });
  }, []);

  const handleDelete = useCallback(() => {
    const { productCode, id } = defaultValue.current || {};

    if (confirm("Xác nhận xóa SP: " + productCode)) {
      setValue(
        "products",
        products.filter((prod: any) => prod?.id !== id)
      );
    }
  }, [defaultValue, products]);

  const onMouseEnterRow = (e: React.MouseEvent<HTMLElement>) => {
    const id = e.currentTarget.dataset.id;

    const currentRow = products.find((item: any) => item.id === id);

    defaultValue.current = currentRow;
  };

  const getPrice = useMemo(() => {
    if (data) {
      return {
        totalPrice: _format.getVND(data?.totalPriceNotTax),
        totalTax: _format.getVND(data?.totalTax),
        finalPrice: _format.getVND(data?.totalPrice),
      };
    } else {
      const initResult = {
        totalPrice: 0,
        totalTax: 0,
        finalPrice: 0,
      };

      const resultObj = products.reduce(
        (result: any, { price, quantity, vat }: any) => {
          const total = quantity * price;

          const tax = (total * vat) / 100;

          return {
            totalPrice: result?.totalPrice + total,
            totalTax: result?.totalTax + tax,
            finalPrice: result?.finalPrice + total + tax,
          };
        },
        initResult
      );

      return {
        totalPrice: _format.getVND(resultObj.totalPrice),
        totalTax: _format.getVND(resultObj.totalTax),
        finalPrice: _format.getVND(resultObj.finalPrice),
      };
    }
  }, [data, products]);

  return (
    <Box className="flex flex-col col-span-2">
      <Box className="flex items-center mb-3 justify-between">
        <Typography className="font-bold uppercase mr-3 text-sm">
          Sản phẩm
        </Typography>

        <AddButton disabled={!!id} onClick={() => onOpen("Add")}>
          Thêm SP
        </AddButton>
      </Box>

      <Box className="bg-white rounded">
        <ContextMenuWrapper
          menuId="product_table_menu"
          menuComponent={
            <Menu className="p-0" id="product_table_menu">
              <Item
                disabled={!!id}
                id="view-product"
                onClick={() => onOpen("Update")}
              >
                Cập nhật
              </Item>
              <Item disabled={!!id} id="delete-product" onClick={handleDelete}>
                Xóa
              </Item>
            </Menu>
          }
        >
          <DataTable
            columns={columns}
            rows={products.map((prod: any, index: number) => ({
              ...prod,
              no: index + 1,
            }))}
            hideFooter
            hideSearchbar
            autoHeight
            componentsProps={{
              row: {
                onMouseEnter: onMouseEnterRow,
              },
            }}
            paginationMode="client"
          />
        </ContextMenuWrapper>

        <List className="border-0 border-t border-solid p-0 pb-1">
          <ListItem className="text-sm grid grid-cols-5 items-center gap-3 py-1 border-b border-0 border-dashed border-grey-3">
            <span className="font-semibold col-span-4 text-right">
              {" "}
              Thành tiền chưa có thuế(VNĐ):
            </span>
            <span className="text-base"> {getPrice.totalPrice}</span>
          </ListItem>
          <ListItem className="text-sm grid grid-cols-5 items-center gap-3 py-1 border-b border-0 border-dashed border-grey-3">
            <span className="font-semibold col-span-4 text-right">
              Thuế GTGT(VNĐ):
            </span>{" "}
            <span className="text-base">{getPrice.totalTax}</span>
          </ListItem>
          <ListItem className="text-sm grid grid-cols-5 items-center gap-3 py-1">
            <span className="font-semibold col-span-4 text-right">
              {" "}
              Tổng cộng tiền thanh toán(VNĐ):
            </span>{" "}
            <span className="text-base">{getPrice.finalPrice}</span>
          </ListItem>
        </List>
      </Box>

      <PurchaseBillDetailProductsDialog
        onClose={onClose}
        open={!!dialog?.open}
        type={dialog?.type}
        defaultValue={defaultValue.current}
        productList={productList}
      />
    </Box>
  );
};
