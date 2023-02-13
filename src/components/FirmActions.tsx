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

const BlockTabs = styled(Tabs)({
  '& .MuiButtonBase-root': {
    textTransform: 'none',
  }
});

export type FirmActionsProps = {
  title?: string;
  renderConfirm?: boolean;
};

export default function FirmActions(props: FirmActionsProps) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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

  return (
    <>
      <Box sx={{ width: '100%', margins: 'auto' }}>
        <BlockTabs
          value={value}
          onChange={handleChange}
          // centered
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tab label="Proposed Actions"/>
          <Tab label={renderLabel(9, 'block proposed', '2023-02-13 12:00')}/>
          <Tab label={renderLabel(8, 'block consensus view', '2023-02-12 12:00')}/>
          <Tab label={renderLabel(7, 'block past', '2023-02-11 12:00')}/>
          <Tab label={renderLabel(6, 'block past', '2023-02-10 12:00')}/>
          <Tab label={renderLabel(5, 'block past', '2023-02-09 12:00')}/>
          <Tab label={renderLabel(4, 'block past', '2023-02-08 12:00')}/>
          <Tab label={renderLabel(3, 'block past', '2023-02-07 12:00')}/>
          <Tab label={renderLabel(2, 'block past', '2023-02-06 12:00')}/>
          <Tab label={renderLabel(1, 'block past', '2023-02-05 12:00')}/>
        </BlockTabs>
      </Box>

      <Grid container spacing={2} justifyContent='space-between' sx={{ mt: 1 }}>
        <Grid item xs>
          <Stack direction="row" spacing={1}>
            <Typography component="span" color="text.secondary">
              id: 
            </Typography>
            <ShortenedBlockId>3cae54b278b737da477a0007ebeb4c24bbd231e724d9c7d5442a9fc2f45aa798</ShortenedBlockId>
            <Button size='small' sx={{ padding: 0, mb: '2em' }}>
              Copy
            </Button>
          </Stack>
        </Grid>

        <Grid item xs>
          <Typography component="span" color="text.secondary">
            Actions:
          </Typography>
          <span> </span>

          <Typography component="span">2</Typography>
        </Grid>

        <Grid item xs>
          <Typography component="span" color="text.secondary">
            Confirmations:  
          </Typography>
          <span> </span>
          <Typography component="span" color='green'>
            4/6 (finalized)
          </Typography>

        </Grid>

        <Grid item>
          <Button size="large">Browse</Button>
          <Button size="large" sx={{ ml: '2em' }}>Confirm</Button>
        </Grid>

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

        { !props.renderConfirm && !props.title &&
          <Grid item xs={12}>
            <ActionCreateCard title="Confirm">
              <ConfirmForm />
            </ActionCreateCard>
          </Grid>
        }

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

        { !props.title &&
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
        }
      </Grid>

    </>
  );
}