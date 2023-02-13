import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { customTextWidthCss } from '../helpers/hashDisplay';
import { styled } from '@mui/material/styles';
import { Stack } from '@mui/material';
import { BlockTags, blockTagsStr } from '../types';
import ShortenedBlockId from './ShortenedBlockId';

export type BlockCardProps = {
  num: number;
  id: string;
  date: string;
  confirmations: number;
  threshold: number;
  tags: BlockTags;
  totalWeight: number;
  confirmed?: boolean;
}

// Number
// Id
// Date
// Confirmers
// Proposals passed

export default function BlockCard(props: BlockCardProps) {
  const color = props.confirmations >= props.threshold ? 'green' : 'red';
  const status = props.confirmations >= props.threshold ? ' (finalized) ' : '';

  return (
    <Card raised sx={{ width: '21em' }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`#${props.num} `}
          {blockTagsStr(props.tags)}
        </Typography>
        {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`${props.id}`}
        </Typography> */}
        <Typography variant="h5" component="div">
          {props.date}          
        </Typography>
        <Box sx={{ mb: 1.5 }}>
          <Typography component="span" color="text.secondary">
            Confirmations:  
          </Typography>
          <span> </span>
          <Typography component="span" color={color}>
            {props.confirmations}/{props.totalWeight}{status}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Typography variant="body2">
            id: 
          </Typography>
          <ShortenedBlockId variant="body2">{props.id}</ShortenedBlockId>
          <Button size='small' sx={{ padding: 0 }}>
            Copy
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Typography variant="body2">
            Actions: 2
          </Typography>
          <Button size='small' sx={{ padding: 0 }}>
            Show
          </Button>
        </Stack>

      </CardContent>
      <CardActions>
        {props.tags[1] === 'view' ? null : <Button>Browse</Button>}
        {props.confirmed || props.tags[0] === 'orphaned' ? null : <Button>Confirm</Button>}
      </CardActions>
    </Card>
  );
}