import React from 'react'
import { Container, Paper, Typography } from '@mui/material'
import { useAppSelector } from '../../global/hooks'
import { selectLocation } from '../../global/slices/appLocation'

export default function NotFoundError () {
  const path = useAppSelector(selectLocation).pathname

  return (
    <Container component="main" sx={{ mb: 4 }}>
      <Paper elevation={8} sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" align="center">
          Not found
        </Typography>
        <Typography align="center">
          {path}
        </Typography>
      </Paper>
    </Container>

  )
}
