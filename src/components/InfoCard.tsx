import * as React from 'react'
import { Card, CardContent, Typography } from '@mui/material'

export type InfoCardProps = {
  title: string
} & React.PropsWithChildren

export default function InfoCard (props: InfoCardProps) {
  // TODO: Extract card markup from Balances, Confirmers and other components
  return (
    <Card raised>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {props.title}
        </Typography>

        {props.children}

      </CardContent>
    </Card>
  )
}
