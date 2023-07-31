import { FunctionComponent, ChangeEvent } from "react";

interface FileInputProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const FileInput: FunctionComponent<FileInputProps> = ({ onChange }) => {
  return (
    <div className="justify-center">
      <input type="file" onChange={onChange} />
    </div>
  );
};
