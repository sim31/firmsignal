import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Button, Grid, Link, Stack, styled, TextField, Typography } from '@mui/material';
import ShortenedBlockId from './ShortenedBlockId';
import ActionCard from './ActionCard';
import IssueTokenAction from './IssueTokenAction';
import UpdateConfirmersAction from './UpdateConfirmersAction';
import ConfirmAction from './ConfirmAction';
import ActionCreateCard from './ActionCreateCard';
import SetDirectoryForm from './SetDirectoryForm';
import UpdateConfirmersForm from './UpdateConfirmersForm';
import ConfirmForm from './ConfirmForm';
import { useAppDispatch, useCopyCallback, useLatestBlocks } from '../global/hooks';
import { getRouteParam } from '../helpers/routes';
import { setLocation } from '../global/slices/appLocation';
import { useCallback, useEffect, useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { setTimedAlert } from '../global/slices/status';
import { blockTagsStr } from '../utils/blockTags';
import { dateToStr, timestampToDate, timestampToDateStr } from 'firmcore/src/helpers/date';

const BlockTabs = styled(Tabs)({
  '& .MuiButtonBase-root': {
    textTransform: 'none',
  }
});

export default function FirmBlocks() {
  const { finalized, proposed, headBlock, routeMatch, chain } = useLatestBlocks();
  const selectedBlockId = getRouteParam(routeMatch, 'block', '');
  const dispatch = useAppDispatch();

  const block = useMemo(() => {
    if (selectedBlockId.length && selectedBlockId !== 'messages') {
      const bl = finalized.find((bl) => bl.id === selectedBlockId);
      if (!bl) {
        return proposed.find((bl) => bl.id === selectedBlockId);
      }
    }
  }, [finalized, proposed, selectedBlockId]);

  function selectBlock(tabValue: string) {
    dispatch(setLocation(`/chains/${chain?.address ?? ''}/blocks/${tabValue}`));
  }

  useEffect(() => {
    if (!selectedBlockId.length) {
      selectBlock('messages');
    }
  }, [selectedBlockId]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    selectBlock(newValue);
  }, []);

  const handleBlIdCopy = useCopyCallback(dispatch, selectedBlockId);

  function renderLabel(num: number, tags: string, date: string) {
    return (
      <>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`#${num} `}
          {tags}
        </Typography>
        <Typography variant="h5" component="div">
          {date}          
        </Typography>
      </>
    )
  }

  function renderBlockTabs() {
    return [...finalized, ...proposed].map((bl) => {
      const tagStr = blockTagsStr(bl.tags);
      return (
        <Tab
          key={bl.id}
          label={renderLabel(bl.height, tagStr, timestampToDateStr(bl.timestamp))}
          value={bl.id}
        />
      )
    });
  }

  return (
    <>
      <Box sx={{ width: '100%', margins: 'auto' }}>
        <BlockTabs
          value={selectedBlockId.length ? selectedBlockId : 'messages'}
          onChange={handleTabChange}
          // centered
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {renderBlockTabs()}
        </BlockTabs>
      </Box>

      <Grid container spacing={2} justifyContent='space-between' sx={{ mt: 1 }}>
        {block &&
          <Grid item xs>
            <Stack direction="row" spacing={1}>
              <Typography component="span" color="text.secondary">
                id: 
              </Typography>
              <ShortenedBlockId>
                {block.id}
              </ShortenedBlockId>
              <Button size='small' sx={{ padding: 0, mb: '2em' }} onClick={handleBlIdCopy}>
                Copy
              </Button>
            </Stack>
          </Grid>
        }

        <Grid item xs>
          <Typography component="span" color="text.secondary">
            Messages:
          </Typography>
          <span> </span>

          <Typography component="span">2</Typography>
        </Grid>

        {block &&
          <Grid item xs>
            <Typography component="span" color="text.secondary">
              Confirmations:  
            </Typography>
            <span> </span>
            <Typography component="span" color='green'>
              4/6 (finalized)
            </Typography>
          </Grid>
        }

        {block &&
          <Grid item>
            {/* <Button size="large">Browse</Button> */}
            <Button size="large" sx={{ ml: '2em' }}>Confirm</Button>
          </Grid>
        }

      </Grid>

    </>
  );
}