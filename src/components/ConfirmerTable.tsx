import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { Link } from '@mui/material'
import { styled } from '@mui/material/styles'
import { shortenedAddr } from '../helpers/hashDisplay'
import { type Account, type Address, type Confirmer } from 'firmcore'

const AccountCell = styled(TableCell)({
  width: '21em',
  maxWidth: '21em',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
})

interface OwnProps {
  confirmers: Confirmer[]
  accounts: Record<Address, Account>
}

export default function ConfirmerTable ({ confirmers, accounts }: OwnProps) {
  function renderName (conf: Confirmer) {
    const account = accounts[conf.address]
    if (account?.name !== undefined && account.name.length > 0) {
      return account.name
    } else {
      return conf.address
    }
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {/* {renderHeadCell('Address')} */}
            <TableCell><b>Account</b></TableCell>
            <TableCell><b>Address</b></TableCell>
            <TableCell align="right"><b>Weight</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {confirmers.map((conf) => (
            <TableRow
              key={conf.address}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <AccountCell component="th" scope="row">
                <Link href="https://test">
                  {renderName(conf)}
                </Link>
              </AccountCell>
              <TableCell>{conf.address}</TableCell>
              <TableCell align="right">{conf.weight}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
