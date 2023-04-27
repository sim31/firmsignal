import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export type ActionCreateCardProps = {
  title: string; // Action name
} & React.PropsWithChildren;

// Number
// Id
// Date
// Confirmers
// Proposals passed

export default function ActionCard(props: ActionCreateCardProps) {

  return (
    <Card raised>

      <CardContent>
        {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          draft
        </Typography> */}
        {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`${props.id}`}
        </Typography> */}
        <Typography variant="h5" component="div" sx={{ mb: 2 }}>
          {props.title}          
        </Typography>

        {props.children}

      </CardContent>

      <CardActions>
        <Button>Propose</Button>
      </CardActions>
    </Card>
  );
}