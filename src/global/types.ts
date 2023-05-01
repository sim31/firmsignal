import { type AlertColor } from '@mui/material'

export interface StatusAlert {
  status: AlertColor | 'none'
  msg: string
}
