import * as React from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { messageTagText } from '../helpers/messageTagDisplay'

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
