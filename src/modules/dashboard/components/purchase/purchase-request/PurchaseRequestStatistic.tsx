import { Box } from "@mui/material";
import { useQuery } from "react-query";
import { purchaseOrder } from "src/api";
import { CardReport } from "~modules-core/components";
import { _format } from "~modules-core/utility/fomat";

export const PurchaseRequestStatistic: React.FC = () => {
  const { data } = useQuery(["PurchaseRequestStatistic"], () =>
    purchaseOrder.getStatistic().then((res) => res.data)
  );

  return (
    <Box className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      <CardReport
        title={"Chưa thực hiện"}
        BgImage={"Orange"}
        value={data?.chuaThucHien}
      />
      <CardReport
        title={"Đang thực hiện"}
        BgImage={"Green"}
        value={data?.dangThucHien}
      />
      <CardReport
        title={"Đã nhập kho"}
        BgImage={"Black"}
        value={data?.daNhapKho}
      />
      <CardReport
        title={"Tổng giá trị"}
        BgImage={"Red"}
        value={_format.getVND(data?.tongGiaTri)}
      />
    </Box>
  );
};
