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
import { Account, AddressStr, ConfirmerValue } from 'firmcontracts/interface/types';

const AccountCell = styled(TableCell)({
  width: '21em',
  maxWidth: '21em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

type OwnProps = {
  confirmers: ConfirmerValue[],
  accounts: Record<AddressStr, Account>,
};

export default function ConfirmerTable({ confirmers, accounts }: OwnProps) {

  function renderName(conf: ConfirmerValue) {
    const account = accounts[conf.addr];
    if (account?.name?.length) {
      return account.name;
    } else {
      return conf.addr;
    }
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
                <Link href="https://test">
                  {renderName(conf)}
                </Link>
              </AccountCell>
              <TableCell align="right">{conf.weight}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}