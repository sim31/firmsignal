import { TextField } from "@mui/material";
import { EditMsgProps, msgTypes } from "../global/messages";
import { useCallback, useState } from "react";
import { newSetDirMsg } from "firmcore";
import firmcore from 'firmcore';
import MessageCreateCard from "./MessageCreateCard";

export default function SetDirectoryForm(props: EditMsgProps) {
  const [value, setValue] = useState(firmcore.randomAddress());
  const idStr = props.id ? props.id : props.msgNumber.toString();
  const typeInfo = msgTypes['setDir'];

  const onDirChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    // TODO: Validate properly
    if (event.target.value.length) {
      props.onChange(newSetDirMsg(event.target.value));
    }
  }, [setValue, props.onChange]);

  return (
    <MessageCreateCard idStr={idStr} title={typeInfo.title}>
      <TextField
        required
        id="name"
        label="IPFS link address"
        variant="standard"
        sx={{ minWidth: '32em' }}
        onChange={onDirChange}
        value={value}
      />
    </MessageCreateCard>
  );
}