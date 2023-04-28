import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Button, Grid, Link, Stack, styled, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector, useCopyCallback, useLatestBlocks } from '../global/hooks';
import { getRouteParam } from '../helpers/routes';
import { setLocation } from '../global/slices/appLocation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { confirmationsText } from '../helpers/confirmationsDisplay';
import { msgTypes } from '../global/messages';
import { blockTagsStr } from '../utils/blockTags';
import { timestampToDateStr } from 'firmcore/src/helpers/date';
import ConfirmDialog from './ConfirmDialog';
import { shortBlockId } from '../helpers/hashDisplay';
import { selectCurrentAccount } from '../global/slices/accounts';
import { confirmBlock, ConfirmBlockArgs } from '../global/slices/chains';
import { setStatusAlert, unsetAlert } from '../global/slices/status';

const BlockTabs = styled(Tabs)({
  '& .MuiButtonBase-root': {
    textTransform: 'none',
  }
});

export default function FirmBlocks() {
  const { finalized, proposed, headBlock, routeMatch, chain } = useLatestBlocks();
  const selectedBlockId = getRouteParam(routeMatch, 'block', '');
  const dispatch = useAppDispatch();
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const accountAddr = useAppSelector(selectCurrentAccount);

  const [block, confirmText] = useMemo(() => {
    if (selectedBlockId.length) {
      let bl = finalized.find((bl) => bl.id === selectedBlockId);
      if (!bl) {
        bl = proposed.find((bl) => bl.id === selectedBlockId);
      }
      return bl ? [bl, confirmationsText(bl)] : [undefined, undefined];
    } else {
      return [undefined, undefined];
    }
  }, [finalized, proposed, selectedBlockId]);

  function selectBlock(tabValue: string) {
    dispatch(setLocation(`/chains/${chain?.address ?? ''}/blocks/${tabValue}`));
  }

  useEffect(() => {
    if (!selectedBlockId.length && headBlock) {
      selectBlock(headBlock.id);
    }
  }, [selectedBlockId]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    selectBlock(newValue);
  }, []);

  const handleBlIdCopy = useCopyCallback(dispatch, selectedBlockId);

  const onConfirmClick = useCallback(() => {
    setConfirmOpen(true);
  }, [])

  const onConfirmAccept = useCallback(async (args: ConfirmBlockArgs) => {
    // TODO: Show error if not enough information (like threshold not set)
    setConfirmOpen(false);
    try {
      // TODO: Spinner
      dispatch(setStatusAlert({
        status: 'info',
        msg: `Confirming block ${shortBlockId(args.blockId)}`
      }));

      await dispatch(confirmBlock(args)).unwrap();
      dispatch(unsetAlert());
    } catch(err) {
      console.log(err);
      const msg = typeof err === 'object' && err && 'message' in err ? err.message : err;
      dispatch(setStatusAlert({
        status: 'error',
        msg: `Failed Confirming a block. Error: ${msg}`
      }));
    }

  }, []);

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
    return [...finalized, ...proposed].reverse().map((bl) => {
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

  function renderMessages() {
    if (!block) {
      return;
    } 
    const msgs = Object.values(block.msgs).map((msg, index) => {
      const typeInfo = msgTypes[msg.name];
      const Component = typeInfo.displayComponent;
      if (Component) {
        return (
          <Grid item key={index}>
            <Component msgNumber={index+1} msg={msg}/>
          </Grid>
        );
      } else {
        return null;
      }
    });

    return (
      <Grid container spacing={4} sx={{ mt: 0, paddingRight: 2}}>
        {msgs}
      </Grid>
    );
  }

  return (
    <>
      <Box sx={{ width: '100%', margins: 'auto' }}>
        <BlockTabs
          value={selectedBlockId.length ? selectedBlockId : undefined}
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
                id: {shortBlockId(block.id)}
              </Typography>
              <Button size='small' sx={{ padding: 0, mb: '2em' }} onClick={handleBlIdCopy}>
                Copy
              </Button>
            </Stack>
          </Grid>
        }

        {block &&
          <Grid item xs>
            <Typography component="span" color="text.secondary">
              Messages:
            </Typography>
            <span> </span>

            <Typography component="span">{block.msgs.length}</Typography>
          </Grid>
        }

        { confirmText &&
          <Grid item xs>
            <Typography component="span" color="text.secondary">
              Confirmations:  
            </Typography>
            <span> </span>
            <Typography component="span" color={confirmText.color}>
              {confirmText.text}
            </Typography>
          </Grid>
        }

        {block &&
          <Grid item>
            {/* <Button size="large">Browse</Button> */}
            <Button size="large" sx={{ ml: '2em' }} onClick={onConfirmClick}>Confirm</Button>
          </Grid>
        }

      </Grid>

      {renderMessages()}

      {block && accountAddr && chain &&
        <ConfirmDialog
          open={confirmOpen}
          block={block}
          confirmerAddress={accountAddr}
          chainAddr={chain.address}
          onReject={() => setConfirmOpen(false)}
          onAccept={onConfirmAccept}
        />
      }

    </>
  );
}