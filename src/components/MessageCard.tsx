import * as React from 'react'
import { customTextWidthCss } from '../helpers/hashDisplay.js'
import { styled } from '@mui/material/styles'
import { Checkbox, Stack, Card, CardContent, CardActions, Typography } from '@mui/material'
import { messageTagText } from '../helpers/messageTagDisplay.js'

export type MessageCardProps = {
  id: string
  title: string // Action name
  selectable?: boolean
} & React.PropsWithChildren

// Number
// Id
// Date
// Confirmers
// Proposals passed

export default function MessageCard (props: MessageCardProps) {
  return (
    <Card raised>
      { props.selectable !== undefined &&
        <CardActions sx={{ margins: 0, paddingBottom: 0 }}>
          <Checkbox sx={{ padding: 0 }}/>
        </CardActions>
      }

      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {messageTagText(props.id)}
        </Typography>
        {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`${props.id}`}
        </Typography> */}
        <Typography variant="h5" component="div">
          {props.title}
        </Typography>

        {props.children}

      </CardContent>
    </Card>
  )
}
