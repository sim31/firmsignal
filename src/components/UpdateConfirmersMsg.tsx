import React from 'react'
import { Link, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'

function createData (
  address: string,
  name: string,
  weight: number
) {
  return { address, name, weight }
}

const rows = [
  createData('0xb3a3762db7ce0544b58569d5bd35a4b9284a6e96', 'Jerry', 2),
  createData('0x199d5ed7f45f4ee35960cf22eade2076e95b253f', 'Tadas', 1),
  createData('0x2e08451b79a01cda253811e45719ceb42640c20d', 'Tom', 1),
  createData('0x4fabb145d64652a948d72533023f6e7a623c7c53', 'Dan', 1),
  createData('0x4fabb145d64652a948d72533023f6e7a623c7c53', '', 1)
]

const rowsRemoved = [
  createData('0xb3a3762db7ce0544b58569d5bd35a4b9284a6e96', 'Will', 2)
]

const AccountCell = styled(TableCell)({
  width: '21em',
  maxWidth: '21em',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
})

export default function UpdateConfirmersMsg () {
  function renderHeadCell (content: string) {
    return (
      <TableCell><b>{content}</b></TableCell>
    )
  }

  return (
    <>
      <Typography sx={{ mt: 1 }}>
        Threshold: 4 / 6
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {/* {renderHeadCell('Address')} */}
              <TableCell><b>Confirmers Added</b></TableCell>
              <TableCell align="right"><b>Weight</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.address}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <AccountCell component="th" scope="row">
                  <Link href="https://test">{row.name.length > 0 ? row.name : row.address}</Link>
                </AccountCell>
                <TableCell align="right">{row.weight}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {/* {renderHeadCell('Address')} */}
              <TableCell><b>Confirmers Removed</b></TableCell>
              <TableCell align="right"><b>Weight</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsRemoved.map((row) => (
              <TableRow
                key={row.address}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <AccountCell component="th" scope="row">
                  <Link href="https://test">{row.name.length > 0 ? row.name : row.address}</Link>
                </AccountCell>
                <TableCell align="right">{row.weight}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
