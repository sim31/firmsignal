import React from 'react'
import { Grid, Link } from '@mui/material'
import MessageCard from './MessageCard.js'
import { type MsgDisplayProps, msgTypes } from '../global/messages.js'

export function SetDirectoryMsg ({ msg, msgNumber, id }: MsgDisplayProps) {
  const typeInfo = msgTypes.setDir
  const dirId = 'dir' in msg ? msg.dir : 'Error: bad props passed'
  const ipfsLink = `ipfs://${dirId}`

  const idStr = id ?? msgNumber.toString()
  return (
    <Grid item>
      {/* TODO: pass full hash? */}
      <MessageCard id={idStr} title={typeInfo.title}>
        <Link
          href={ipfsLink}
          target='_blank'
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {ipfsLink}
        </Link>
      </MessageCard>
    </Grid>
  )
}
