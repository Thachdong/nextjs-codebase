import DownloadIcon from "@mui/icons-material/SimCardDownloadOutlined";
import { ButtonBase, ButtonProps } from "@mui/material";
import clsx from "clsx";
import { useCallback } from "react";

type TProps = ButtonProps & {
  api: (params?: any) => Promise<TBaseResponse<any>>;
  filterParams?: any;
};

export const ExportButton: React.FC<TProps> = (props) => {
  const { api, filterParams, className, children, ...restProps } = props;

  const handleExport = useCallback(async () => {
    try {
      const res = await api(filterParams);

      const { FileContents, FileDownloadName, ContentType } = res.data || {};

      const a = document.createElement("a");

      document.body.appendChild(a);

      a.download = FileDownloadName;

      a.href = `data:${ContentType};base64,${FileContents}`;

      a.click();

      a.remove();
    } catch (error) {
      console.log(error);
    }
  }, [api, filterParams]);

  return (
    <ButtonBase
      {...restProps}
      className={clsx(
        "px-3 text-main bg-[#F3F6F9] h-[40px] w-[40px] rounded border border-solid border-[#edf0f2] active:bg-main active:text-white",
        className
      )}
      onClick={handleExport}
    >
      <DownloadIcon />
      {children}
    </ButtonBase>
  );
};
