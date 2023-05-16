import { TextField } from '@mui/material'
import { type EditMsgProps, msgTypes } from '../global/messages'
import React, { useCallback, useState } from 'react'
import firmcore, { newSetDirMsg } from 'firmcore'
import { isValidCid0, urlToCid0 } from 'firmcore/src/helpers/cid'
import MessageCreateCard from './MessageCreateCard'
import InvalidArgument from 'firmcore/src/exceptions/InvalidArgument'

export default function SetDirectoryForm (props: EditMsgProps) {
  const [value, setValue] = useState('');
  const idStr = props.id !== undefined ? props.id : props.msgNumber.toString()
  const typeInfo = msgTypes.setDir

  const onDirChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValue(value)
      try {
        const cid = isValidCid0(value) ? value : urlToCid0(value);
        props.onChange(newSetDirMsg(cid))
      } catch (err) {
        if (!(err instanceof InvalidArgument)) {
          console.error(err);
        }
      }
    }, [props])

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
  )
}
