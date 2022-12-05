import { Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { TRenderControllerParams } from "~types/react-hook-form";
import { TFormInputProps } from "~types/form-controlled/form-input";
import { FormInputBase } from "~modules-core/components/form-bases";
import clsx from "clsx";

export const FormInput: React.FC<TFormInputProps> = (props) => {
  const { controlProps, label, ...textFieldProps } = props;

  const renderController = ({
    field: { value, ref, ...restField },
    fieldState: { error },
    formState: { errors },
  }: TRenderControllerParams) => {
    const rules = controlProps.rules || {};

    const updateLabel = Object.keys(rules).includes("required")
      ? `${label} *`
      : label;

    const defaultProps = {
      helperText: (
        <ErrorMessage
          errors={errors}
          name={controlProps.name}
          render={({ message }) => message}
        />
      ),
      error: !!error,
      value: value || "",
      label: updateLabel,
      ...restField,
      ...textFieldProps,
    };

    return (
      <FormInputBase
        {...defaultProps}
        className={clsx(
          defaultProps.disabled == true && "bg-[#f0f0f0]",
          "!h-[40px]"
        )}
      />
    );
  };

  return <Controller {...controlProps} render={renderController} />;
};
