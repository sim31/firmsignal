import { TextField } from "@mui/material";
import { CreateMsgProps } from "../global/messages";
import { useCallback, useState } from "react";
import { newSetDirMsg } from "firmcore";
import firmcore from 'firmcore';

export default function SetDirectoryForm(props: CreateMsgProps) {
  const [value, setValue] = useState(firmcore.randomAddress());

  const onDirChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    // TODO: Validate properly
    if (event.target.value.length) {
      props.onChange(newSetDirMsg(event.target.value));
    }
  }, [setValue]);

  return (
    <TextField
      required
      id="name"
      label="IPFS link address"
      variant="standard"
      sx={{ minWidth: '32em' }}
      onChange={onDirChange}
      value={value}
    />
  );
}