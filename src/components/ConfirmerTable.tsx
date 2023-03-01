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
import { FullConfirmer } from '../global/types';

const AccountCell = styled(TableCell)({
  width: '21em',
  maxWidth: '21em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

type OwnProps = {
  confirmers: FullConfirmer[];
};

export default function ConfirmerTable({ confirmers }: OwnProps) {

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
          {confirmers.map((conf) => (
            <TableRow
              key={conf.addr}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <AccountCell component="th" scope="row">
                <Link href="https://test">{conf.name?.length ? conf.name : conf.addr}</Link>
              </AccountCell>
              <TableCell align="right">{conf.weight}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}