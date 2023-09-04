import { Button, CardActions, Stack, Typography } from '@mui/material'
import React, { useCallback } from 'react'
import InfoCard from './InfoCard.js'
import { Chain } from '../global/slices/chains.js'
import { Address } from 'firmcore'
import { useAppDispatch, useCopyCallback } from '../global/hooks.js'

export interface ChainCardProps {
  chain: Chain
  onSelect: (addr: Address) => void
}

export default function ChainCard (props: ChainCardProps) {
  const { chain, onSelect } = props

  const dispatch = useAppDispatch();
  const onSelectClick = useCallback(
    () => {
      onSelect(chain.address);
    },
    [chain, onSelect],
  );
  const handleIdCopy = useCopyCallback(dispatch, chain?.address ?? '');

  return (
    <InfoCard title={chain.name}>
      <Stack direction="row" spacing={1}>
        <Typography>
          Address: {chain.address}
        </Typography>
        <Button size='small' sx={{ padding: 0 }} onClick={handleIdCopy}>
          Copy
        </Button>
      </Stack>
      <Typography>
        Symbol: {chain.symbol}
      </Typography>

      <CardActions>
        <Button size='large' onClick={onSelectClick}>Select</Button>
      </CardActions>
    </InfoCard>
  )
}
