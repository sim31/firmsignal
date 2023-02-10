import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { shortenedAddr } from '../helpers/hashDisplay';

function createData(
  address: string,
  name: string,
  weight: number,
) {
  return { address, name, weight };
}


const rows = [
  createData('0xb3a3762db7ce0544b58569d5bd35a4b9284a6e96', 'Jerry', 2),
  createData('0x199d5ed7f45f4ee35960cf22eade2076e95b253f', 'Tadas', 1),
  createData('0x2e08451b79a01cda253811e45719ceb42640c20d', 'Tom', 1),
  createData('0x4fabb145d64652a948d72533023f6e7a623c7c53', 'Dan', 1),
  createData('0x4fabb145d64652a948d72533023f6e7a623c7c53', '', 1),
];

const AccountCell = styled(TableCell)({
  width: '21em',
  maxWidth: '21em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export default function ConfirmerTable() {

  function renderHeadCell(content: string) {
    return (
      <TableCell><b>{content}</b></TableCell>
    )
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {/* {renderHeadCell('Address')} */}
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
              <AccountCell component="th" scope="row">
                <Link href="https://test">{row.name && row.name.length ? row.name : row.address}</Link>
              </AccountCell>
              <TableCell align="right">{row.weight}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}