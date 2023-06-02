import { type AlertColor } from '@mui/material'

export type StatusAlert = {
  status: AlertColor
  msg: string
} | {
  status: 'none'
}
