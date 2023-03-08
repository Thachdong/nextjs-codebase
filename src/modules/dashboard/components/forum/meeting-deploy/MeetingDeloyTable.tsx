import { Box, ButtonBase, Drawer, Tooltip, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { Item, Menu } from "react-contexify";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import { meetingDeploy, taskGroup, taskList, TJobGroup } from "src/api";
import {
  ContextMenuWrapper,
  DataTable,
  DropdownButton,
  StatusChip,
} from "~modules-core/components";
import { useSession } from "~modules-core/customHooks/useSession";
import { _format } from "~modules-core/utility/fomat";
import {
  MeetingDeployDialog,
  MeetingDeployMailReponse,
} from "~modules-dashboard/components";
import { TGridColDef } from "~types/data-grid";

type TProps = {
  data?: any;
  paginationProps?: any;
  isLoading?: boolean;
  isFetching?: boolean;
  refetch: () => void;
};

export const MeetingDeloyTable: React.FC<TProps> = ({
  data,
  paginationProps,
  isLoading,
  isFetching,
  refetch,
}) => {
  const defaultValue = useRef<any>();

  const [repply, setReply] = useState(false);

  const { userInfo } = useSession();

  const columns: TGridColDef[] = [
    {
      field: "created",
      headerName: "Ngày tạo",
      align: "left",
      minWidth: 100,
      flex: 1,
      type: "date",
      filterKey: "createdDate",
      renderCell: ({ row }) => _format.converseDate(row?.created),
    },
    {
      field: "departmentName",
      headerName: "Phòng ban",
      align: "left",
      minWidth: 150,
      flex: 1,
      filterKey: "jobGroupName",
    },
    {
      field: "startTime",
      headerName: "Ngày tiến hành",
      align: "left",
      minWidth: 150,
      flex: 1,
      filterKey: "performDate",
      renderCell: ({ row }) => _format.converseDate(row?.startTime),
    },
    {
      field: "endTime",
      headerName: "Thời gian kết thúc",
      align: "left",
      minWidth: 150,
      flex: 1,
      filterKey: "endTime",
      renderCell: ({ row }) => _format.converseDate(row?.endTime),
    },
    {
      field: "descriptionJob",
      headerName: "Mô tả công việc",
      align: "left",
      minWidth: 250,
      flex: 1,
      filterKey: "petitionerName",
      renderCell: ({ row }) => {
        return (
          <>
            <Tooltip title="Xem phản hồi">
              <ButtonBase onClick={() => setReply(true)}>
                <Typography className="text-main text-sm text-left">
                  {row?.descriptionJob}
                </Typography>
              </ButtonBase>
            </Tooltip>
          </>
        );
      },
    },
    {
      field: "proposerName",
      headerName: "Người đề xuất",
      align: "left",
      minWidth: 150,
      filterKey: "proposerName",
      flex: 1,
    },
    {
      field: "secretaryName",
      headerName: "Thư ký",
      align: "left",
      minWidth: 150,
      flex: 1,
      filterKey: "secretaryName",
    },
    {
      field: "participant",
      headerName: "Nguời tham gia",
      align: "left",
      minWidth: 200,
      flex: 1,
      filterKey: "co_ParticipantName",
      renderCell: ({ row }) => {
        const listParticipant = JSON.parse(row?.participant || "[]");
        return (
          <>
            <Box className="grid ">
              {listParticipant.map((item: any) => (
                <Typography className="text-sm">
                  {" "}
                  {item?.paticipantName}
                </Typography>
              ))}
            </Box>
          </>
        );
      },
    },
    {
      field: "status",
      headerName: "Trạng thái",
      align: "left",
      minWidth: 100,
      flex: 1,
      renderCell: ({ row }) => {
        const colors = ["success", "default", "error"];
        return (
          <StatusChip
            status={row?.status}
            label={row?.statusName}
            color={colors[row?.status] as any}
          />
        );
      },
    },
    {
      field: "accept",
      headerName: "Tham gia",
      align: "left",
      minWidth: 100,
      flex: 1,
      renderCell: ({ row }) => {
        const listParticipant = JSON.parse(row?.participant || "[]");
        const isAccept = listParticipant.find(
          (item: any) => item?.id == userInfo?.userInfo?.userId
        );
        return (
          <>
            {isAccept ? (
              <ButtonBase
                onClick={() => handleAcceptMeeting(row?.id)}
                className="bg-success text-white px-2 py-1 rounded font-semibold"
              >
                Tham gia
              </ButtonBase>
            ) : null}
          </>
        );
      },
    },
    {
      field: "action",
      headerName: "",
      width: 50,
      renderCell: ({ row }) => (
        <DropdownButton
          id={row?.id as string}
          items={[
            {
              action: () => handleOpenUpdate(),
              label: "Cập nhật trạng thái",
            },
            {
              action: () => handleDeleteTaskGroup(),
              label: "Xoá",
            },
          ]}
        />
      ),
    },
  ];

  // HANDLE GET VALUE ROW
  const onMouseEnterRow = (e: React.MouseEvent<HTMLElement>) => {
    const id = e.currentTarget.dataset.id;

    const currentRow = data?.find((item: any) => item.id === id);

    defaultValue.current = currentRow;
  };

  // HANDLE UPDATE GROUP TASK IN DIALOG
  const [Open, setOpen] = useState(false);

  const handleOpenUpdate = () => {
    setOpen(true);
  };

  const handleCloseUpdate = () => {
    setOpen(false);
  };

  // HANDLE DELETE GROUP TASK IN DIALOG
  const mutateDelete = useMutation(
    (payload: { id: string }) => meetingDeploy.delete(payload?.id),
    {
      onSuccess: (data) => {
        toast.success(data.resultMessage);

        refetch?.();
      },
    }
  );

  const handleDeleteTaskGroup = () => {
    if (confirm("Xác nhận xoá task!")) {
      mutateDelete.mutateAsync(defaultValue?.current);
    }
  };

  //   HANDLE ACCEPT MEETING
  const mutateAccept = useMutation(
    (payload: { meetingDeployId: string }) =>
      meetingDeploy.acceptMetting(payload),
    {
      onSuccess: (data) => {
        toast.success(data.resultMessage);

        refetch?.();
      },
    }
  );

  const handleAcceptMeeting = (id: string) => {
    mutateAccept.mutateAsync({ meetingDeployId: id });
  };

  return (
    <>
      <ContextMenuWrapper
        menuId="taskGroup_table_menu"
        menuComponent={
          <Menu className="p-0" id="taskGroup_table_menu">
            <Item id="update-product" onClick={handleOpenUpdate}>
              Cập nhật trạng thái
            </Item>
            <Item id="delete-product" onClick={handleDeleteTaskGroup}>
              Xóa
            </Item>
          </Menu>
        }
      >
        <DataTable
          rows={data as any}
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
      <MeetingDeployDialog
        onClose={handleCloseUpdate}
        open={Open}
        refetch={refetch}
        type="Update"
        defaultValue={defaultValue.current}
      />
      <Drawer anchor={"right"} open={repply} onClose={() => setReply(false)}>
        <MeetingDeployMailReponse data={defaultValue.current} />
      </Drawer>
    </>
  );
};
