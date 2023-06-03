import React, { useCallback, useState } from 'react'
import { Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { isValidCid0, parseIPFSId, urlToCid0 } from 'firmcore/src/helpers/cid.js';
import { InvalidArgument } from 'firmcore/src/exceptions/InvalidArgument.js';
import { useAppDispatch } from '../global/hooks.js';
import { importChain } from '../global/slices/chains.js';
import { setStatusAlert, unsetAlert } from '../global/slices/status.js';
import { setLocation } from '../global/slices/appLocation.js';

export default function ImportChain() {
  const [cid, setCid] = useState<string>('');
  const dispatch = useAppDispatch();

  const onCidChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setCid(value)
    }, [setCid]
  );

  const onSubmit = useCallback(async () => {
    try {
      const cidStr = parseIPFSId(cid);
      dispatch(setStatusAlert({
        status: 'info',
        msg: 'Importing firmchain...'
      }));
      const { chainPoint } = await dispatch(importChain(cidStr)).unwrap();
      dispatch(unsetAlert());
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      dispatch(setLocation(`/chains/${chainPoint?.cidStr}`))
    } catch (err) {
      if (!(err instanceof InvalidArgument)) {
        console.error(err);
      }
    }
  }, [cid, dispatch]);

  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Paper elevation={8} sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center">
          Import a Chain
        </Typography>
        {/* <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Smart contract
        </Typography> */}
        <Stack spacing={3}>
          <TextField
            required
            variant="standard"
            label="CID"
            value={cid}
            onChange={onCidChange}
            />

          <Box
            m={1}
            display="flex"
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            <Button
              size="large"
              color="primary"
              sx={{ mr: 2, fontSize: 18 }}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={onSubmit}
            >
              Import
            </Button>
          </Box>
        </Stack>

      </Paper>
    </Container>
  );
}
