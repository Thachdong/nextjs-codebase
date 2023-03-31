import {
  Avatar,
  Box,
  Link,
  List,
  ListItem,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { discussion } from "src/api";
import { _format } from "~modules-core/utility/fomat";
import { toast } from "react-toastify";
import clsx from "clsx";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { ForumCommentBox } from "../../task/task-list";

type TProps = {
  data: any;
};

export const DiscussionMailReponse: React.FC<TProps> = ({ data }) => {
  const { data: dataRepList, refetch } = useQuery(
    ["taskListMail", "loading"],
    () =>
      discussion
        .getListMailReponse({
          discussionId: data?.id,
        })
        .then((res) => res.data)
  );

  const mutateRepply = useMutation(
    (payload: any) => discussion.createMailReponse(payload),
    {
      onSuccess: (data) => {
        toast.success(data.resultMessage);

        refetch?.();
      },
    }
  );

  return (
    <Box className="min-w-[700px] h-screen relative">
      <Box
        className={clsx(
          data?.status === 1 || data?.status === 2
            ? "h-[78%] overflow-y-scroll "
            : ""
        )}
      >
        <List className="grid gap-3 px-3">
          {dataRepList?.length > 0 ? (
            <>
              {dataRepList?.map((item: any, index: number) => {
                const listAttachFile = item?.attachFile
                  ? item?.attachFile.split(",")
                  : [];
                return (
                  <ListItem
                    key={index}
                    className="flex gap-3 items-start border border-solid border-[#f2f2f2] rounded w-full shadow min-h-[76px]"
                  >
                    <Box className="text-center max-w-[70px]">
                      <Tooltip title={item?.fullName || "Anonymus"}>
                        {item?.avatar ? (
                          <img
                            src={item?.avatar}
                            width={30}
                            height={30}
                            className="rounded-full"
                          />
                        ) : (
                          <Avatar className="m-auto" />
                        )}
                      </Tooltip>
                      <Typography className="truncate text-xs">{item?.fullName}</Typography>
                    </Box>

                    <Box className="w-full">
                      <Box className="flex justify-between items-start">
                        <Box>
                          <Typography className="text-base font-semibold">
                            {item?.title}
                          </Typography>
                          <Typography className="text-xs text-[#908d8d]">
                            {_format.converseDateTime(item?.created)}
                          </Typography>
                        </Box>
                        {/* {!!item?.statusName && (
                          <Box>
                            <Typography className="text-xs text-main border border-solid px-2 py-[2px] border-main rounded-full font-semibold">
                              {item.statusName}
                            </Typography>
                          </Box>
                        )} */}
                      </Box>

                      <Typography className="text-sm mt-2 text-[#838181]">
                        {item?.content}
                      </Typography>

                      {listAttachFile.length > 0 ? (
                        <Box className="mt-3 bg-[#eaf0f3] rounded p-3">
                          <Typography className="text-sm font-semibold text-[#484747]">
                            File đính kèm
                          </Typography>
                          <List className="p-0 grid grid-cols-6 gap-3 mt-3">
                            {listAttachFile.map(
                              (item: string, index: number) => (
                                <ListItem
                                  key={index}
                                  className="w-fit text-ellipsis overflow-hidden whitespace-nowrap px-2 py-1 rounded bg-white"
                                >
                                  <Link href={item}>
                                    <a className="text-main no-underline text-sm flex items-center font-semibold gap-3">
                                      <InsertDriveFileIcon />{" "}
                                      <span>File {index}</span>
                                    </a>
                                  </Link>
                                </ListItem>
                              )
                            )}
                          </List>
                        </Box>
                      ) : null}
                    </Box>
                  </ListItem>
                );
              })}
            </>
          ) : (
            <>
              {" "}
              <Typography className="text-xl text-[#9b9999] text-center pt-4 font-semibold">
                Không có phản hồi
              </Typography>
            </>
          )}
        </List>
      </Box>

      {data?.status === 1 ||
        (data?.status === 2 && (
          <ForumCommentBox
            fileLoader={discussion.uploadFile}
            mutateAdd={mutateRepply}
            idObject={{ discussionId: data?.id }}
          />
        ))}
    </Box>
  );
};
