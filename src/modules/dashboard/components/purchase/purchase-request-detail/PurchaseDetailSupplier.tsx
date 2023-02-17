import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { branchs, suppliers } from "src/api";
import { FormInputBase, FormSelectAsync } from "~modules-core/components";

type TProps = {
  disabled: boolean;
};

export const PurchaseDetailSupplier: React.FC<TProps> = ({ disabled }) => {
  const [supplier, setSupplier] = useState<any>();

  const { control } = useFormContext();

  return (
    <Box className="grid grid-cols-2 gap-4 mb-4">
      <Box className="flex flex-col">
        <Typography className="font-bold uppercase mb-3">
          THÔNG TIN NHÀ CUNG CẤP
        </Typography>

        <Box className="bg-white grid gap-4 rounded-sm flex-grow p-3">
          <FormSelectAsync
            fetcher={suppliers.getList}
            controlProps={{
              name: "supplierId",
              control,
              rules: { required: "Phải chọn nhà cung cấp" },
            }}
            callback={(opt) => setSupplier(opt)}
            label="Chọn nhà cung cấp"
            labelKey="supplierCode"
          />

          <FormInputBase label="Địa chỉ" value={supplier?.address} disabled />

          <FormInputBase
            label="Mã số thuế"
            value={supplier?.taxCode}
            disabled
          />

          <FormInputBase
            label="Nhóm sản phẩm cung cấp"
            value={supplier?.address}
            disabled
          />
        </Box>
      </Box>

      <Box className="flex flex-col">
        <Typography className="font-bold uppercase mb-3">
          THÔNG TIN LIÊN HỆ
        </Typography>

        <Box className="bg-white grid gap-4 rounded-sm flex-grow p-3">
          <FormInputBase
            label="Người phụ trách"
            value={supplier?.curatorName}
            disabled
          />

          <FormInputBase
            label="Chức vụ"
            value={supplier?.curatorPositionName}
            disabled
          />

          <FormInputBase
            label="Điện thoại"
            value={supplier?.curatorPhone}
            disabled
          />

          <FormInputBase
            label="Email"
            value={supplier?.curatorEmail}
            disabled
          />
        </Box>
      </Box>
    </Box>
  );
};
