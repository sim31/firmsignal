import * as React from 'react';
import { Stack } from '@mui/system';
import InfoCard from './InfoCard';
import BlockCard from './BlockCard';


export default function FirmHistory() {
  return (
    <Stack spacing={6} sx={{ mt: '2em' }}>
      <Stack direction="row" justifyContent="center">
        <BlockCard 
          num={5}
          id={'9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0'}
          date={'2023-02-10 12:03'}
          confirmations={4}
          threshold={4}
          totalWeight={6}
          tags={['consensus', 'view']}
        />
      </Stack>

      <Stack direction="row" justifyContent="center">
        <BlockCard 
          num={4}
          id={'3cae54b278b737da477a0007ebeb4c24bbd231e724d9c7d5442a9fc2f45aa798'}
          date={'2023-02-09 12:00'}
          confirmations={4}
          threshold={4}
          totalWeight={6}
          confirmed
          tags={['past']}
        />
      </Stack>

      <Stack direction="row" justifyContent="center" spacing={6}>
        <BlockCard 
          num={3}
          id={'dkb1ld2278b737da477a0007ebeb4c24bbd231e724d9c7d5442a9fc2f45aa798'}
          date={'2023-02-09 12:00'}
          confirmations={4}
          threshold={4}
          totalWeight={6}
          confirmed
          tags={['past']}
        />
        <BlockCard 
          num={3}
          id={'13brm1e878b737da477a0007ebeb4c24bbd231e724d9c7d5442a9fc2f45aa798'}
          date={'2023-02-09 12:00'}
          confirmations={2}
          threshold={4}
          totalWeight={6}
          tags={['orphaned']}
        />
      </Stack>

      <Stack direction="row" justifyContent="center">
        <BlockCard 
          num={3}
          id={'8alk4ne878b737da477a0007ebeb4c24bbd231e724d9c7d5442a9fc2f45aa798'}
          date={'2023-02-09 12:00'}
          confirmations={6}
          threshold={4}
          totalWeight={6}
          tags={['past']}
        />
      </Stack>

      <Stack direction="row" justifyContent="center">
        <BlockCard 
          num={3}
          id={'fa3k4ne878b737da477a0007ebeb4c24bbd231e724d9c7d5442a9fc2f45aa798'}
          date={'2023-02-09 12:00'}
          confirmations={5}
          threshold={4}
          totalWeight={6}
          tags={['past']}
        />
      </Stack>
    </Stack>

  );
}