import * as React from 'react'
import { messageTagText } from '../helpers/messageTagDisplay.js'
import { Card, CardContent, Typography } from '@mui/material'

export type MessageCreateCardProps = {
  idStr: string
  title: string // Action name
} & React.PropsWithChildren

// Number
// Id
// Date
// Confirmers
// Proposals passed

export default function MessageCreateCard (props: MessageCreateCardProps) {
  return (
    <Card raised>

      <CardContent>
        {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          draft
        </Typography> */}
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {messageTagText(props.idStr)}
        </Typography>
        <Typography variant="h5" component="div" sx={{ mb: 2 }}>
          {props.title}
        </Typography>

        {props.children}

      </CardContent>

      {/* <CardActions>
        <Button>Propose</Button>
      </CardActions> */}
    </Card>
  )
}
