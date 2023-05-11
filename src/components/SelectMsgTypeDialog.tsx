import * as React from 'react'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import PersonIcon from '@mui/icons-material/Person'
import AddIcon from '@mui/icons-material/Add'
import Typography from '@mui/material/Typography'
import { blue } from '@mui/material/colors'
import { EFMsg, msgTypeNames, type MsgTypeName } from 'firmcore'
import { MsgTypeInfo, msgTypes } from '../global/messages'

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
