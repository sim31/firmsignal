import * as React from 'react'
import { styled, alpha } from '@mui/material/styles'
import {
  IconButton, InputBase, MenuItem, Select, type SelectChangeEvent,
  Box, AppBar, Toolbar, Typography
} from '@mui/material'
import { customTextWidthCss } from '../helpers/hashDisplay.js'
import { useCopyCallback, useAppSelector, useAppDispatch, useRouteMatcher } from '../global/hooks.js'
import { rootRouteMatcher } from '../global/routes.js'
import { selectChainName, selectChainsByAddress, selectFocusChain, setFocusChain } from '../global/slices/chains.js'
import { setLocation } from '../global/slices/appLocation.js'
import { getRouteParam } from '../helpers/routes.js'
import { loadWallet, selectCurrentAccount } from '../global/slices/accounts.js'
import { useCallback, useEffect } from 'react'
import * as ContentCopyIcon from '@mui/icons-material/ContentCopy.js'
import { setStatusAlert, unsetAlert } from '../global/slices/status.js'
import { selectCurrentMountpoint } from '../global/slices/mounts.js'
import * as AdjustIcon from '@mui/icons-material/Adjust.js';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  marginRight: theme.spacing(2),
  width: '100%'
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 1.5),
    // vertical padding + font size from searchIcon
    // paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    // transition: theme.transitions.create('width'),
    width: '100%'
  }
}))

const StyledSelect = styled(Select)(({ theme }) => ({
  '& > div': {
    padding: theme.spacing(1.2, 1, 1.2, 1.5),
    borderRadius: theme.shape.borderRadius,
    border: 0,
    backgroundColor: alpha(theme.palette.common.white, 0.15)
    // '&:hover': {
    //   backgroundColor: alpha(theme.palette.common.white, 0.25),
    // },
    // '& > div:hover': {
    //   backgroundColor: alpha(theme.palette.common.white, 0.25),
    // },
  },
  '& svg': {
    fill: theme.palette.common.white
  }
}))

const ShortenedAddr = styled('div')(customTextWidthCss())

const StyledAddr = styled(ShortenedAddr)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  color: theme.palette.common.white
}))

const StyledAddrBlack = styled(ShortenedAddr)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  }
}))

export default function FirmBar () {
  const routeMatch = useRouteMatcher(rootRouteMatcher)
  const chainsByAddr = useAppSelector(selectChainsByAddress)
  const currentAccount = useAppSelector(selectCurrentAccount)
  const chainId = getRouteParam(routeMatch, 'chainId', '')
  const name = useAppSelector(
    state => selectChainName(state, chainId)
  )
  const mountpoint = useAppSelector(selectCurrentMountpoint);
  const dispatch = useAppDispatch()

  const mpColor = mountpoint?.status === 'connected' ? 'white' : 'red';
  const mpText = mountpoint?.name !== 'unknown' ? mountpoint?.name : mountpoint?.id;

  const chainValue = React.useMemo(() => {
    if (routeMatch.value == null) {
      return ''
    } else if (routeMatch.value.name === 'CreateChain') {
      return 'newChain'
    } else if (routeMatch.value.name === 'FirmChain') {
      return chainId
    } else if (routeMatch.value.name === 'ImportChain') {
      return 'importChain'
    } else {
      return ''
    }
  }, [routeMatch.value, chainId])

  const handleSelectChain = useCallback((e: SelectChangeEvent<unknown>) => {
    const val = e.target.value as string
    if (val === 'newChain' || val === 'importChain') {
      dispatch(setLocation(val));
    } else {
      dispatch(setLocation(`/chains/${val}`));
    }
  }, [dispatch])

  const handleAccountCopy = useCopyCallback(dispatch, currentAccount)

  function renderMenuItems () {
    const items = Object.values(chainsByAddr).map((chain) => {
      const title = chain.name;
      return (
        <MenuItem value={chain.address} key={chain.address}>{title}</MenuItem>
      )
    })

    items.push((
      <MenuItem value="newChain" key="new">New Chain</MenuItem>
    ))

    return items
  }

  function renderChainSelection (value: unknown) {
    // const text = value === 'None' ? 'Select chain' : value as string;
    let text = ''
    if (value === 'newChain') {
      text = 'New Chain'
    } else if (value === undefined || value === '') {
      text = 'Select Chain'
    // } else if (value === 'importChain') {
    //   text = 'Import Chain'
    } else if (name !== undefined) {
      text = name
    } else {
      text = value as string
    }
    return <StyledAddr>{text}</StyledAddr>
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              marginRight: '1em',
              display: {
                md: 'block',
                xs: 'none'
              }
            }}
          >
            FirmSignal
          </Typography>
          {/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
          <StyledSelect
            value={chainValue}
            onChange={handleSelectChain}
            renderValue={renderChainSelection}
            displayEmpty
          >
            <MenuItem disabled value="">
              Select Chain
            </MenuItem>
            {renderMenuItems()}
          </StyledSelect>

          <Typography
            variant="h5"
            component="div"
            sx={{
              marginRight: '0.5em',
              marginLeft: '0.5em'
            }}
          >
            <b>://</b>
          </Typography>
          <Search>
            <StyledInputBase
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          { mpText !== undefined &&
            <>
              <AdjustIcon.default sx={{ mr: '0.5em', color: mpColor }}/>
              <span>{mpText} </span>
            </>

          }

          {/* TODO: Render in a wayt that is clearer that this is the account */}
          { currentAccount !== undefined &&
            <>
              <IconButton sx={{ color: 'white' }} onClick={handleAccountCopy}>
                <ContentCopyIcon.default />
              </IconButton>
              <ShortenedAddr>{currentAccount}</ShortenedAddr>
            </>
          }
        </Toolbar>
      </AppBar>
    </Box>
  )
}
