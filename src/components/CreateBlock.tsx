import { Button, Card, Container, Grid, Stack, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector, useCurrentChainRoute, useLatestBlocks } from "../global/hooks";
import { createBlock, selectHead } from "../global/slices/chains";
import { useCallback, useState } from "react";
import ShortenedBlockId from "./ShortenedBlockId";
import { EFMsg, MsgTypeName } from "firmcore";
import MessageCreateCard from "./MessageCreateCard";
import UpdateConfirmersForm from "./UpdateConfirmersForm";
import SetDirectoryForm from "./SetDirectoryForm";
import AddIcon from '@mui/icons-material/Add';
import { css, FormControl, IconButton, InputLabel, Select } from '@mui/material';
import useIncrementingId from "../hooks/useIncrementingId";
import { SelectMsgTypeDialog } from "./SelectMsgTypeDialog";
import { MsgContent, MsgTypeInfo, isValidMsg, msgTypes } from "../global/messages";
import { type } from "os";
import ProgrammingError from "firmcore/src/exceptions/ProgrammingError";
import { setStatusAlert, unsetAlert } from "../global/slices/status";
import NotFoundError from "./Errors/NotFoundError";
import NotFound from "firmcore/src/exceptions/NotFound";
import { setLocation } from "../global/slices/appLocation";

type MsgId = string;
type MsgEntry = MsgContent & { id: MsgId, typeName: MsgTypeName };

export default function CreateBlock() {
  const { headBlock, chain } = useLatestBlocks();
  const height = headBlock ? headBlock.height + 1 : undefined;
  const [msgs, setMsgs] = useState<Record<MsgId, MsgEntry>>({});
  const newMsgId = useIncrementingId('msg');
  const [newMsgOpen, setNewMsgOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();

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
      const newEntry = newMsgEntry(typeName);
      setMsgs({ ...msgs, [newEntry.id]: newEntry });
    }
  }, [newMsgEntry, msgs, setNewMsgOpen]);

  const onMsgChange = useCallback((id: MsgId, content: MsgContent) => {
    const currentMsg = msgs[id];
    if (!currentMsg) {
      throw new ProgrammingError(`msg entry with id ${id} does not exist`);
    }
    setMsgs({
      ...msgs,
      [id]: { ...content, id, typeName: currentMsg.typeName},
    })
  }, [msgs, setMsgs]);

  const onSubmit = useCallback(
    async () => {
      // TODO: Show error if not enough information (like threshold not set)
      try {
        // TODO: Spinner
        dispatch(setStatusAlert({
          status: 'info',
          msg: 'Creating firmchain...',
        }));

        if (!chain) {
          throw new NotFound("Chain not found");
        }

        const ms = Object.values(msgs).map(m => {
          if (isValidMsg(m)) {
            return m;
          } else {
            throw new Error(m.what);
          }
        });

        const args = { chainAddr: chain.address, msgs: ms };
        await dispatch(createBlock(args)).unwrap();
        dispatch(unsetAlert());
        dispatch(setLocation(`/chains/${chain.address}`));
      } catch(err) {
        console.log(err);
        const msg = typeof err === 'object' && err && 'message' in err ? err.message : err;
        dispatch(setStatusAlert({
          status: 'error',
          msg: `Failed creating new chain. Error: ${msg}`
        }));
      }
    
  }, [msgs, dispatch, setStatusAlert, setLocation, createBlock, chain]);

  function renderMessages() {
    // TODO: issue a token?
    const rMsgs = Object.values(msgs).map((msg, index) => {
      const typeInfo = msgTypes[msg.typeName];
      const Component = typeInfo.editComponent;
      if (Component) {
        return (
          <Grid item key={msg.id}>
            <Component msgNumber={index+1} onChange={(m) => onMsgChange(msg.id, m)}/>
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
          <Button size="large" onClick={onAddMsg}>Add Message</Button>
        </Grid>

        <Grid item>
          <Button size="large" onClick={onSubmit}>Submit</Button>
        </Grid>

        <Grid item xs>
          <Stack direction='row' spacing={8} justifyContent='flex-end'>
            <Typography component="span" color="text.secondary">
              Block number: {height}
            </Typography>

            <Typography component="span" color="text.secondary">
              Messages: {Object.entries(msgs).length}
            </Typography>

          </Stack>

          {renderMessages()}
        </Grid>

      </Grid>

      <SelectMsgTypeDialog open={newMsgOpen} onClose={onNewMsgClose} />

    </>
  );
}