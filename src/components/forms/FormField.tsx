import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  name: string;
};

type InputFieldProps = FieldProps & InputHTMLAttributes<HTMLInputElement>;
type TextAreaFieldProps = FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function InputField({ label, name, ...props }: InputFieldProps) {
  return (
    <div className="ds-field">
      <label htmlFor={name}>{label}</label>
      <input className="ds-input" id={name} name={name} {...props} />
    </div>
  );
}

export function TextAreaField({ label, name, ...props }: TextAreaFieldProps) {
  return (
    <div className="ds-field">
      <label htmlFor={name}>{label}</label>
      <textarea className="ds-input" id={name} name={name} {...props} />
    </div>
  );
}
