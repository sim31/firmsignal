import { Button, Card, Container, Grid, Stack, Typography } from "@mui/material";
import { useAppSelector, useCurrentChainRoute, useLatestBlocks } from "../global/hooks";
import { selectHead } from "../global/slices/chains";
import { useCallback, useState } from "react";
import ShortenedBlockId from "./ShortenedBlockId";
import { EFMsg, MsgTypeName } from "firmcore";
import ActionCreateCard from "./ActionCreateCard";
import UpdateConfirmersForm from "./UpdateConfirmersForm";
import SetDirectoryForm from "./SetDirectoryForm";
import AddIcon from '@mui/icons-material/Add';
import { css, FormControl, IconButton, InputLabel, Select } from '@mui/material';
import useIncrementingId from "../hooks/useIncrementingId";
import { SelectMsgTypeDialog } from "./SelectMsgTypeDialog";
import { MsgTypeInfo, msgTypes } from "../global/messages";
import { type } from "os";

interface InputError {
  what: string;
}
type MsgContent = EFMsg | InputError;
type MsgEntry = MsgContent & { id: string, typeName: MsgTypeName };

export default function CreateBlock() {
  const { headBlock } = useLatestBlocks();
  const height = headBlock ? headBlock.height + 1 : undefined;
  const [msgs, setMsgs] = useState<MsgEntry[]>([]);
  const newMsgId = useIncrementingId('msg');
  const [newMsgOpen, setNewMsgOpen] = useState<boolean>(false);

  const onAddMsg = useCallback(() => {
    setNewMsgOpen(true);
  }, []);

  const newMsgEntry = useCallback<(type: MsgTypeName) => MsgEntry>((type: MsgTypeName) => {
    return {
      id: newMsgId(),
      typeName: type,
      what: "Not filled",
    }
  }, [newMsgId]);

  const onNewMsgClose = useCallback((typeName?: MsgTypeName) => {
    setNewMsgOpen(false);
    if (typeName) {
      setMsgs([...msgs, newMsgEntry(typeName)])
    }
  }, [newMsgEntry, msgs, setNewMsgOpen]);

  function renderMessages() {
    // TODO: issue a token?
    const rMsgs = msgs.map(msg => {
      const typeInfo = msgTypes[msg.typeName];
      const Component = typeInfo.component;
      if (Component) {
        return (
          <Grid item key={msg.id}>
            <ActionCreateCard title={typeInfo.title}>
              <Component />
            </ActionCreateCard>
          </Grid>
        );
      } else {
        return null;
      }
    });

    return (
      <Grid container spacing={4} sx={{ mt: 0, paddingRight: 2}}>
        {rMsgs}
      </Grid>

    );
  }

  return (
    <>
      <Grid container spacing={2} sx={{ mt: 1, mr: 2, ml: 2 }}>

        <Grid item>
          <Button size="large" sx={{ ml: '2em' }} onClick={onAddMsg}>Add message</Button>
        </Grid>

        <Grid item xs>
          <Stack direction='row' spacing={8} justifyContent='flex-end'>
            <Typography component="span" color="text.secondary">
              Block number: {height}
            </Typography>

            <Typography component="span" color="text.secondary">
              Messages: {msgs.length}
            </Typography>

          </Stack>

          {renderMessages()}
        </Grid>

      </Grid>

      <SelectMsgTypeDialog open={newMsgOpen} onClose={onNewMsgClose} />

    </>
  );
}