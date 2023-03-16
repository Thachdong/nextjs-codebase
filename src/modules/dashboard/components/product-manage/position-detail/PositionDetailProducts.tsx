import { Box, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { position } from "src/api";
import { DataTable, RefreshButton } from "~modules-core/components";
import { defaultPagination } from "~modules-core/constance";
import { usePathBaseFilter } from "~modules-core/customHooks";
import { positionProductColumns } from "~modules-dashboard/pages/product-manage/storage/data";

export const PositionDetailProducts: React.FC = () => {
  const router = useRouter();

  const { query } = router;

  const { id } = query;

  const [pagination, setPagination] = useState(defaultPagination);

  const [searchParams, setSearchParams] = useState<any>({});

  usePathBaseFilter(pagination);

  // WATCHING QUERY AND TRIGGER FETCHING DATA
  useEffect(() => {
    const queryKeys = Object.keys(query);

    const params: any = {};

    queryKeys.map((key) => {
      if (!key.includes("history_")) {
        params[key] = query[key];
      }
    });

    setSearchParams(params);
  }, [query]);

  // FETCH DATA
  const { data, refetch } = useQuery(
    [
      "ProductListIn_" + id,
      {
        ...pagination,
        searchParams,
      },
    ],
    () =>
      position
        .getProductByPositionId({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          positionId: id,
          ...searchParams,
        })
        .then((res) => res.data),
    {
      enabled: !!id,
      onSuccess: (data) => {
        setPagination({ ...pagination, total: data?.totalItem });
      },
    }
  );

  return (
    <Box className="mb-4">
      <Box className="flex items-center justify-between mb-3">
        <Typography className="font-bold uppercase mb-3 text-sm">
          THÔNG TIN SẢN PHẨM
        </Typography>
        <RefreshButton onClick={() => refetch()} />
      </Box>

      <Box className="bg-white">
        <DataTable
          columns={positionProductColumns}
          rows={data?.items || []}
          autoHeight={true}
          paginationMode="client"
        />
      </Box>
    </Box>
  );
};
