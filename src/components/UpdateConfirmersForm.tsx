import React from 'react';
import { Button, Checkbox, FormControlLabel, FormGroup, IconButton, Link, Stack, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'

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

const AccountCell = styled(TableCell)({
  width: '21em',
  maxWidth: '21em',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
})

export default function UpdateConfirmersForm () {
  return (
    <Stack>
      <TextField
        required
        type="number"
        id="threshold"
        label="Threshold"
        variant="standard"
        sx={{ width: '6em' }}
      />

      <Typography color="text.secondary" sx={{ mt: 3 }}>
        Confirmers to remove
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {/* {renderHeadCell('Address')} */}
              <Checkbox sx={{ mt: 0.5 }}></Checkbox>
              <TableCell><b>Account</b></TableCell>
              <TableCell align="right"><b>Weight</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.address}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <Checkbox sx={{ mt: 0.5 }}></Checkbox>
                <AccountCell component="th" scope="row">
                  <Link href="https://test">{row.name.length > 0 ? row.name : row.address}</Link>
                </AccountCell>
                <TableCell align="right">{row.weight}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography color="text.secondary" sx={{ mt: 3 }}>
        Confirmers to add
      </Typography>

      <Stack direction="row" spacing={1}>
        <IconButton aria-label="delete" sx={{ padding: 0, mt: '0.5em' }}>
          x
        </IconButton>
        <TextField
          required
          label="Name"
          variant="standard"
          sx={{ width: '14em' }}
        />
        <TextField
          required
          label="Address"
          variant="standard"
          fullWidth
        />
        <TextField
          required
          type="number"
          label="Weight"
          variant="standard"
          sx={{ width: '6em' }}
        />
      </Stack>

      <Stack direction="row" spacing={1}>
        <IconButton aria-label="delete" sx={{ padding: 0, mt: '0.5em' }}>
          x
        </IconButton>
        <TextField
          required
          label="Name"
          variant="standard"
          sx={{ width: '14em' }}
        />
        <TextField
          required
          label="Address"
          variant="standard"
          fullWidth
        />
        <TextField
          required
          type="number"
          label="Weight"
          variant="standard"
          sx={{ width: '6em' }}
        />
      </Stack>

      <Button sx={{ mt: 2 }}>Add confirmer</Button>

    </Stack>

  )
}
