import { TextField } from '@mui/material'
import { type EditMsgProps, msgTypes } from '../global/messages.js'
import React, { useCallback, useState } from 'react'
import { newSetDirMsg } from 'firmcore'
import { isValidCid0, parseIPFSId, urlToCid0 } from 'firmcore/src/helpers/cid.js'
import MessageCreateCard from './MessageCreateCard.js'
import { InvalidArgument } from 'firmcore/src/exceptions/InvalidArgument.js'

export default function SetDirectoryForm (props: EditMsgProps) {
  const [value, setValue] = useState('');
  const idStr = props.id !== undefined ? props.id : props.msgNumber.toString()
  const typeInfo = msgTypes.setDir

  const onDirChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValue(value)
      try {
        const cid = parseIPFSId(value);
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
