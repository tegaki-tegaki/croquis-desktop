import { clsx } from "clsx";
import React, { MutableRefObject, forwardRef } from "react";

type Props = {
  label: string;
  id?: string;
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  checked?: boolean;
};

export const Checkbox = forwardRef(
  (
    { id, className, label, onChange, checked }: Props,
    ref: MutableRefObject<HTMLInputElement>
  ) => {
    const _id = id || `checkbox-${React.useId()}`;

    return (
      <div className="hstack align-center">
        <input
          id={_id}
          className={clsx(className, "cd-checkbox")}
          type="checkbox"
          name={_id}
          onChange={onChange}
          checked={checked}
          ref={ref}
        />
        <label className="cd-text cd-label--inline" htmlFor={_id}>
          {label}
        </label>
      </div>
    );
  }
);
