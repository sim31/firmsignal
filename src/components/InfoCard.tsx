import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ConfirmerTable from './ConfirmerTable';
import { TextField } from '@mui/material';
import BalancesTable from './BalancesTable';

export type InfoCardProps = {
  title: string
} & React.PropsWithChildren;

export default function InfoCard(props: InfoCardProps) {
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
  );
}