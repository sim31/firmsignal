import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import ShortenedBlockId from './ShortenedBlockId';
import { useMemo } from 'react';
import { useAppDispatch, useCopyCallback } from '../global/hooks';
import { EFBlockPOD } from 'firmcore';
import { TaggedBlock, blockTagsStr } from '../utils/blockTags';
import { dateToStr, timestampToDate, timestampToDateStr } from 'firmcore/src/helpers/date';

export type BlockCardProps = {
  block: TaggedBlock;
}

// Number
// Id
// Date
// Confirmers
// Proposals passed

export default function BlockCard({ block }: BlockCardProps) {
  const dispatch = useAppDispatch();
  const state = block.state;

  const [color, status] = useMemo(() => {
    if (block.tags[0] === 'past' || block.tags[0] === 'consensus') {
      return ['green', '(finalized)'];
    } else if (block.tags[0] === 'genesis') {
      return [undefined, undefined];
    } else if (block.tags[0] === 'proposed') {
      return ['orange', '(not finalized)'];
    } else {
      return ['red', ''];
    }
  }, [block]);

  // TODO: Check if current user account is confirmer and confirmed this block
  const confirmed = false;

  const dateStr = useMemo(() => {
    return timestampToDateStr(block.timestamp);    
  }, [block]);

  const handleIdCopy = useCopyCallback(dispatch, block.id);

  return (
    <Card raised sx={{ width: '21em' }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`#${block.height} `}
          {blockTagsStr(block.tags)}
        </Typography>
        {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`${props.id}`}
        </Typography> */}
        <Typography variant="h5" component="div">
          {dateStr}
        </Typography>
        { status && color &&
          <Box sx={{ mb: 1.5 }}>
            <Typography component="span" color="text.secondary">
              Confirmations:  
            </Typography>
            <span> </span>
            <Typography component="span" color={color}>
              {state.confirmationStatus.currentWeight}/{state.confirmationStatus.potentialWeight}{status}
            </Typography>
          </Box>
        }

        <Stack direction="row" spacing={1}>
          <Typography variant="body2">
            id: 
          </Typography>
          <ShortenedBlockId variant="body2">{block.id}</ShortenedBlockId>
          <Button size='small' sx={{ padding: 0 }} onClick={handleIdCopy}>
            Copy
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Typography variant="body2">
            Messages: {block.msgs.length}
          </Typography>
          <Button size='small' sx={{ padding: 0 }}>
            Show
          </Button>
        </Stack>

      </CardContent>
      <CardActions>
        {/* {props.tags[1] === 'view' ? null : <Button>Browse</Button>} */}
        {confirmed || block.tags[0] === 'orphaned' ? null : <Button>Confirm</Button>}
      </CardActions>
    </Card>
  );
}