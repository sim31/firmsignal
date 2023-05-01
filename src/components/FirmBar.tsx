import * as React from 'react'
import { styled, alpha } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import MenuItem from '@mui/material/MenuItem'
import { css, FormControl, IconButton, InputLabel, Select, type SelectChangeEvent } from '@mui/material'
import { customTextWidthCss } from '../helpers/hashDisplay'
import { useCopyCallback, useCurrentChainRoute, useRouteMatcher, useAppSelector, useAppDispatch } from '../global/hooks'
import { rootRouteMatcher } from '../global/routes'
import { selectChainName, selectChainsByAddress } from '../global/slices/chains'
import { setLocation } from '../global/slices/appLocation'
import { getRouteParam } from '../helpers/routes'
import { setCurrentAccount, selectDefaultAccount, selectCurrentAccount, selectAccountsByAddress } from '../global/slices/accounts'
import { useCallback, useEffect } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import copy from 'copy-to-clipboard'
import { setTimedAlert } from '../global/slices/status'

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
  const defaultAccount = useAppSelector(selectDefaultAccount)
  const currentAccount = useAppSelector(selectCurrentAccount)
  const accountsByAddr = useAppSelector(selectAccountsByAddress)
  const chainId = getRouteParam(routeMatch, 'chainId', '')
  const name = useAppSelector(
    state => selectChainName(state, chainId)
  )

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (currentAccount === undefined && defaultAccount !== undefined) {
      dispatch(setCurrentAccount(defaultAccount))
    }
  }, [currentAccount, defaultAccount, dispatch])

  const chainValue = React.useMemo(() => {
    if (routeMatch.value == null) {
      return ''
    } else if (routeMatch.value.name === 'CreateChain') {
      return 'newChain'
    } else if (routeMatch.value.name === 'FirmChain') {
      return chainId
    } else {
      return ''
    }
  }, [routeMatch.value, chainId])

  const handleSelectChain = useCallback((e: SelectChangeEvent<unknown>) => {
    const val = e.target.value as string
    const newLoc = val === 'newChain' ? val : `/chains/${val}`
    dispatch(setLocation(newLoc))
  }, [dispatch])

  const handleSelectAccount = useCallback((e: SelectChangeEvent<unknown>) => {
    const val = e.target.value as string
    dispatch(setCurrentAccount(val))
  }, [dispatch])

  const handleAccountCopy = useCopyCallback(dispatch, currentAccount)

  function renderMenuItems () {
    const items = Object.values(chainsByAddr).map((chain) => {
      const title = chain.name ?? chain.address
      return (
        <MenuItem value={chain.address} key={chain.address}>{title}</MenuItem>
      )
    })

    items.push((
      <MenuItem value="newChain" key="new">New Chain</MenuItem>
    ))

    return items
  }

  function renderAccountItems () {
    const items = Object.keys(accountsByAddr).map((account) => {
      // TODO: Check if name is registered in the current chain and use that name?
      const addr = account
      return (
      <MenuItem value={addr} key={addr}>
        <StyledAddrBlack>{addr}</StyledAddrBlack>
      </MenuItem>
      )
    })
    return items
  }

  function renderChainSelection (value: unknown) {
    // const text = value === 'None' ? 'Select chain' : value as string;
    let text = ''
    if (value === 'newChain') {
      text = 'New Chain'
    } else if (value === undefined || value === '') {
      text = 'Select Chain'
    } else if (name !== undefined) {
      text = name
    } else {
      text = value as string
    }
    return <StyledAddr>{text}</StyledAddr>
  }

  function renderAccountSelection (value: unknown) {
    // const text = value === 'None' ? 'Select chain' : value as string;
    return <StyledAddr>{value as string}</StyledAddr>
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

          {/* TODO: Render in a wayt that is clearer that this is the account */}
          <StyledSelect
            value={currentAccount !== undefined || ''}
            onChange={handleSelectAccount}
            label='Account'
            labelId='account-select'
            renderValue={renderAccountSelection}
            // displayEmpty
          >
            {renderAccountItems()}
          </StyledSelect>
          <IconButton sx={{ color: 'white' }} onClick={handleAccountCopy}>
            <ContentCopyIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
