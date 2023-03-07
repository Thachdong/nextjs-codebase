import { Box, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { useQueries } from "react-query";
import { customerCareGroup, staff } from "src/api";
import {
  FormDatepicker,
  FormInput,
  FormSelect,
} from "~modules-core/components";
import { customerCareStatus } from "~modules-core/constance";

type TProps = {
    disabled: boolean;
}

export const CustomerCareContent: React.FC<TProps> = ({disabled}) => {
  const { control } = useFormContext();

  const options = useQueries([
    {
      queryKey: "SaleList",
      queryFn: () => staff.getListSale().then((res) => res.data),
    },
    {
      queryKey: "CustomerCareGroup",
      queryFn: () => customerCareGroup.getAll().then((res) => res.data),
    },
  ]);

  return (
    <Box>
      <Typography className="text-sm font-medium mb-3">NỘI DUNG</Typography>

      <Box className="grid grid-cols-2 gap-4 rounded bg-white mb-4">
        <FormSelect
          controlProps={{
            name: "salesId",
            control: control,
            rules: { required: "Phải chọn sale phụ trách" },
          }}
          options={options[0]?.data || []}
          label={"Sale phụ trách"}
          labelKey="fullName"
          disabled={disabled}
        />

        <FormSelect
          controlProps={{
            name: "action",
            control: control,
            rules: { required: "Phải chọn nhóm" },
          }}
          options={options[1]?.data || []}
          label={"Nhóm"}
          labelKey="actionName"
          disabled={disabled}
        />

        <FormDatepicker
          controlProps={{
            name: "performDate",
            control: control,
          }}
          label={"Ngày thực hiện"}
          disabled={disabled}
        />

        <FormSelect
          controlProps={{
            name: "status",
            control: control,
          }}
          options={customerCareStatus}
          label={"Trạng thái"}
          valueKey="value"
          labelKey="label"
          disabled={disabled}
        />

        <FormInput
          controlProps={{
            name: "plan",
            control: control,
          }}
          label={"Kế hoạch thực hiện"}
          multiline
          minRows={3}
          disabled={disabled}
        />

        <FormInput
          controlProps={{
            name: "result",
            control: control,
          }}
          label={"Kết quả thực hiện"}
          multiline
          minRows={3}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
};
