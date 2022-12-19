import { Box } from "@mui/material";
import _ from "lodash";
import { useCallback, useState } from "react";
import { useQuery } from "react-query";
import { position, TPosition } from "src/api";
import { AddButton } from "~modules-core/components";
import {
  CreatePositionDialog,
  PositionDialog,
  PositionList,
  PositionStatus,
} from "~modules-dashboard/components";
import { TDefaultDialogState } from "~types/dialog";

export const WarehousePage: React.FC = () => {
  // EXTRACT PROPS
  const [dialog, setDialog] = useState<TDefaultDialogState>({ open: false });

  const [defaultValue, setDefaultValue] = useState<TPosition>();

  // DIALOG METHODS
  const onDialogClose = useCallback(() => {
    setDialog({ open: false });
  }, []);

  const onDialogOpen = useCallback((type: string, data: TPosition) => {
    setDialog({ open: true, type });

    setDefaultValue(data);
  }, []);

  // DATA FETCHING
  const { data, refetch } = useQuery(["product-manage-warehouse"], () =>
    position
      .getList({
        pageIndex: 1,
        pageSize: 999,
      })
      .then((res) => {
        const items = res?.data?.items || [];
        const warehouseList = items.map((item) => ({
          warehouseConfigID: item?.warehouseConfigID,
          warehouseConfigCode: item?.warehouseConfigCode,
        }));

        const uniqWarehouses = _.uniqBy(
          warehouseList,
          (warehouse) => warehouse?.warehouseConfigID
        );

        const updatedItems = uniqWarehouses.map((warehouse) => ({
          ...warehouse,
          positions: items?.filter(
            (item) => item?.warehouseConfigID === warehouse?.warehouseConfigID
          ),
        }));

        return {
          ...res?.data,
          items: updatedItems,
        };
      })
  );

  // DOM RENDER
  return (
    <Box>
      <Box className="grid grid-cols-2 mb-3">
        <PositionStatus />

        <Box className="flex items-center justify-end">
          <AddButton
            onClick={() => setDialog({ open: true, type: "Add" })}
            variant="contained"
            className="mr-3"
          >
            Thêm vị trí
          </AddButton>
        </Box>
      </Box>

      <Box className="grid grid-cols-2 gap-4">
        {data?.items.map((item: any) => (
          <PositionList
            onDialogOpen={onDialogOpen}
            warehouse={item}
            key={item?.warehouseConfigID}
          />
        ))}
      </Box>

      <CreatePositionDialog
        onClose={onDialogClose}
        open={dialog.open}
        type={dialog.type}
        refetch={refetch}
        defaultValue={{} as any}
        title="THÊM MỚI VỊ TRÍ"
      />

      <PositionDialog
        onClose={onDialogClose}
        open={dialog.open && dialog.type === "View"}
        refetch={refetch}
        defaultValue={defaultValue as any}
        title="THÔNG TIN VỊ TRÍ LƯU"
      />
    </Box>
  );
};
