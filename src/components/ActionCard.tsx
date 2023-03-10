import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { customTextWidthCss } from '../helpers/hashDisplay';
import { styled } from '@mui/material/styles';
import { Checkbox, Stack } from '@mui/material';
import { actionHeaderStr, ActionStatus, actionTagsStr, BlockTags, blockTagsStr } from '../global/types';

export type ActionCardProps = {
  id: string;
  status: ActionStatus;
  title: string; // Action name
  selectable?: boolean;
} & React.PropsWithChildren;

// Number
// Id
// Date
// Confirmers
// Proposals passed

export default function ActionCard(props: ActionCardProps) {

  return (
    <Card raised>
      { props.selectable &&
        <CardActions sx={{ margins: 0, paddingBottom: 0 }}>
          <Checkbox sx={{ padding: 0 }}/>
        </CardActions>
      }

      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {actionHeaderStr(props.id, props.status)}
        </Typography>
        {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`${props.id}`}
        </Typography> */}
        <Typography variant="h5" component="div">
          {props.title}          
        </Typography>

        {props.children}

      </CardContent>
    </Card>
  );
}