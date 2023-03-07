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
import { blockTagsStr, Chain } from '../global/types';
import { useAppDispatch, useCopyCallback, useLatestBlocks } from '../global/hooks';
import { timestampToDate, timestampToDateStr } from '../helpers/date';
import { getRouteParam } from '../helpers/routes';
import { setLocation } from '../global/slices/appLocation';
import { useCallback, useEffect, useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { setTimedAlert } from '../global/slices/status';

const BlockTabs = styled(Tabs)({
  '& .MuiButtonBase-root': {
    textTransform: 'none',
  }
});

export default function FirmBlocks() {
  const { filledBlocks, blockTags, routeMatch, chain } = useLatestBlocks(12);
  const selectedBlockId = getRouteParam(routeMatch, 'block', '');
  const dispatch = useAppDispatch();

  const block = useMemo(() => {
    if (selectedBlockId.length && selectedBlockId !== 'messages') {
      return filledBlocks?.find((bl) => bl.state.blockId === selectedBlockId);
    }
  }, [filledBlocks, selectedBlockId]);

  function selectBlock(tabValue: string) {
    dispatch(setLocation(`/chains/${chain?.address ?? ''}/proposals/${tabValue}`));
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
    const tabs = [
      (<Tab key='messages' value='messages' label="Proposed Messages"/>),
    ];

    if (filledBlocks && blockTags) {
      const newTabs = filledBlocks.map((bl, index) => {
        const tags = blockTags[index];
        const tagsStr = tags ? blockTagsStr(tags) : '';
        return (
          <Tab
            key={bl.state.blockId}
            label={renderLabel(bl.state.blockNum, tagsStr, timestampToDateStr(bl.header.timestamp))}
            value={bl.state.blockId}
          />
        )
      });
      tabs.push(...newTabs);
    }

    return tabs;
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
                {block.state.blockId}
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

      <Grid container spacing={4} sx={{ mt: 0, paddingRight: 2}}>
        <Grid item>
          <ActionCreateCard title="Set Directory">
            <SetDirectoryForm />
          </ActionCreateCard>
        </Grid>

        <Grid item>
          <ActionCreateCard title="Set Home Space">
            <Stack direction="row">
              <TextField
                required
                label="Home Space id (3 words)"
                variant="standard"
                sx={{ minWidth: '18em' }}
              />
              <Button size="small">Generate</Button>
            </Stack>
          </ActionCreateCard>
        </Grid>

        <Grid item>
          <ActionCreateCard title="Issue token">
            <TextField
              required
              label="Receiver"
              variant="standard"
              sx={{ minWidth: '18em', mr: 4, mb: 4 }}
            />

            <TextField
              required
              label="Amount"
              variant="standard"
              type="number"
            />
          </ActionCreateCard>

        </Grid>

        <Grid item>
          <ActionCreateCard title="Update Confirmers">
            <UpdateConfirmersForm />
          </ActionCreateCard>
        </Grid>

        {/* // TODO: */}
        {/* { !props.renderConfirm && !props.title &&
          <Grid item xs={12}>
            <ActionCreateCard title="Confirm">
              <ConfirmForm />
            </ActionCreateCard>
          </Grid>
        } */}

        <Grid item>
          {/* TODO: pass full hash? */}
          <ActionCard id="fs2k34lad" status="finalized" title="Set Directory">
            <Link>ipfs://QmekpHNKhz7CcCLyP2MwbyerFutd9JL4KXveANy57vbHZq</Link>
          </ActionCard>
        </Grid>

        <Grid item>
          <ActionCard id="l2d3491" status="finalized" title="Set Home Space">
            time radical rough
          </ActionCard>
        </Grid>

        <Grid item>
          <ActionCard id="k1abk91" status="finalized" title="Issue Token">
            <IssueTokenAction />

          </ActionCard>
        </Grid>

        <Grid item>
          <ActionCard id="k1abk91" status="finalized" title="Update Confirmers">
            <UpdateConfirmersAction />

          </ActionCard>
        </Grid>

        {/* { !props.title &&
          <>
            <Grid item xs={12}>

              <ActionCard id="f1bbo11" status="finalized" title="Confirm">
                <Link>
                  Some Other Fractal
                </Link>

                <ConfirmAction />

              </ActionCard>
            </Grid>

            <Grid item xs={12}>

              <ActionCard id="f1bbo11" status="finalized" title="Indirect Confirm">
                <Link component="span">
                  Fractal2
                </Link>
                <span> through </span>
                <Link component="span">
                  Some Other Fractal
                </Link>
                <span> block </span>
                <Link component="span">
                  3cae54b2...
                </Link>

                <ConfirmAction />

              </ActionCard>
            </Grid>
          </>
        } */}
      </Grid>

    </>
  );
}