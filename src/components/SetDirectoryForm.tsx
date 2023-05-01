import { TextField } from '@mui/material'
import { type EditMsgProps, msgTypes } from '../global/messages'
import React, { useCallback, useState } from 'react'
import firmcore, { newSetDirMsg } from 'firmcore'
import MessageCreateCard from './MessageCreateCard'

export default function SetDirectoryForm (props: EditMsgProps) {
  const [value, setValue] = useState(firmcore.randomAddress())
  const idStr = props.id !== undefined ? props.id : props.msgNumber.toString()
  const typeInfo = msgTypes.setDir

  const onDirChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value)
      // TODO: Validate properly
      if (event.target.value.length > 0) {
        props.onChange(newSetDirMsg(event.target.value))
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
