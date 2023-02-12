import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Button, Grid, Link, Stack, styled, Typography } from '@mui/material';
import { customTextWidthCss } from '../helpers/hashDisplay';

const BlockTabs = styled(Tabs)({
  '& .MuiButtonBase-root': {
    textTransform: 'none',
  }
});

// TODO: Make reusable (BlockCard uses it)
const ShortenedBlockId = styled(Typography)(customTextWidthCss('6em'));

export default function FirmProposals() {
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

      <Grid container spacing={2} justifyContent='space-between' sx={{ mt: 2 }}>
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
    </>
  );
}