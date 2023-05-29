import * as React from 'react'
import { type MsgTypeName } from 'firmcore'
import { MsgTypeInfo, msgTypes } from '../global/messages.js'
import { Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemText } from '@mui/material'

export interface SelectMsgTypeDialogProps {
  open: boolean
  onClose: (selectedValue?: MsgTypeName) => void
}

export function SelectMsgTypeDialog (props: SelectMsgTypeDialogProps) {
  const { onClose, open } = props

  const handleClose = () => {
    onClose()
  }

  const handleListItemClick = (value: string) => {
    onClose(value as MsgTypeName)
  }

  const readyMsgTypes = React.useMemo(() => {
    const obj: Record<string, MsgTypeInfo> = {};
    return Object.entries(msgTypes).reduce((prevObject, [key, val]) => {
      if (val.editComponent !== undefined) {
        prevObject[key] = val;
        return prevObject;
      } else {
        return prevObject;
      }
    }, obj)
  }, [])

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Select message type</DialogTitle>
      <List sx={{ pt: 0 }}>
        {Object.entries(readyMsgTypes).map(([msgType, typeInfo]) => (
          <ListItem disableGutters key={msgType}>
            <ListItemButton onClick={() => { handleListItemClick(msgType) }} key={msgType}>
              <ListItemText primary={typeInfo.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  )
}
