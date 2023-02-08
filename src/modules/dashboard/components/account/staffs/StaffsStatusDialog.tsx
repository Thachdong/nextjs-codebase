import { Box, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useCallback, useState } from "react";
import { useMutation } from "react-query";
import { staff, TUpdateStaffStatus } from "src/api";
import { BaseButton, Dialog } from "~modules-core/components";
import { accountStatus } from "~modules-core/constance";
import { toast } from "~modules-core/toast";
import { TDialog } from "~types/dialog";

export const StaffsStatusDialog: React.FC<TDialog> = ({
  onClose,
  open,
  refetch,
  defaultValue,
}) => {
  const [status, setStatus] = useState<number>(defaultValue?.status || 0);

  const title = "Cập nhật trạng thái nhân viên";

  const mutateUpdate = useMutation(
    (payload: TUpdateStaffStatus) => staff.updateStatus(payload),
    {
      onSuccess: (data) => {
        toast.success(data.resultMessage);

        refetch?.();

        onClose();
      },
    }
  );

  const handleUpdate = useCallback(async () => {
    if (defaultValue?.id) {
      await mutateUpdate.mutateAsync({
        id: defaultValue?.id,
        status: +status,
      });
    }
  }, [defaultValue?.id, status]);

  return (
    <Dialog onClose={onClose} open={open} maxWidth="sm" title={title}>
      <RadioGroup
        defaultValue={defaultValue?.status}
        onChange={(e) => setStatus(+e.target.value)}
      >
        {accountStatus?.map((status: any) => (
          <FormControlLabel
            key={status.value}
            value={status.value}
            control={<Radio />}
            label={status.label}
          />
        ))}
      </RadioGroup>

      <Box className="flex justify-center items-center mt-4">
        <BaseButton
          onClick={handleUpdate}
          disabled={status === defaultValue?.exportStatus}
        >
          Cập nhật
        </BaseButton>
        <BaseButton type="button" className="!bg-main-1 ml-3" onClick={onClose}>
          Đóng
        </BaseButton>
      </Box>
    </Dialog>
  );
};
