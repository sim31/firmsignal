import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import { css, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { customTextWidthCss } from '../helpers/hashDisplay';
import { useRouteMatcher } from '../global/hooks';
import { rootRouteMatcher } from '../global/routes';
import { selectChainsByAddress } from '../global/slices/chains';
import { useAppSelector, useAppDispatch, } from '../global/hooks';
import { setLocation } from '../global/slices/appLocation';
import { getRouteParam } from '../helpers/routes';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  width: '100%',
}));


const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 1.5),
    // vertical padding + font size from searchIcon
    // paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    // transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& > div': {
    padding: theme.spacing(1.2, 1, 1.2, 1.5),
    borderRadius: theme.shape.borderRadius,
    border: 0,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    // '&:hover': {
    //   backgroundColor: alpha(theme.palette.common.white, 0.25),
    // },
    // '& > div:hover': {
    //   backgroundColor: alpha(theme.palette.common.white, 0.25),
    // },
  },
  '& svg': {
    fill: theme.palette.common.white,
  },
}));


const ShortenedAddr = styled('div')(customTextWidthCss());

const StyledAddr = styled(ShortenedAddr)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  color: theme.palette.common.white,
}));

// const defaultAddrWidth = {
//   '--max-width': '6em',
// } as React.CSSProperties;

// const shortened = css({
//   width: '100%',
//   maxWidth: 'var(--max-width)',
//   overflow: 'hidden',
//   textOverflow: 'ellipsis',
// })

// const StyledAddrCustom = styled('div')(shortened, ({ theme }) => ({
//   '&:hover': {
//     backgroundColor: alpha(theme.palette.common.white, 0.25),
//   },
//   color: theme.palette.common.white,
//   // shortened,
// }));

// const StyledAddr = (props: React.PropsWithChildren) => {
//   return (
//     <StyledAddrCustom style={defaultAddrWidth}>
//     </StyledAddrCustom>
//   );
// }


export default function FirmBar() {
  const routeMatch = useRouteMatcher(rootRouteMatcher);
  const chainsByAddr = useAppSelector(selectChainsByAddress);
  const dispatch = useAppDispatch();

  // TODO: Redirect to default chain or something else if non existing chain id
  // TODO: Move this to App. This should be controlled through props I think
  const value = React.useMemo(() => {
    if (!routeMatch.value) {
      return '';
    } else if (routeMatch.value.name === 'CreateChain') {
      return 'newChain';
    } else if (routeMatch.value.name === 'FirmChain') {
      return getRouteParam(routeMatch, 'chainId', '');
    } else {
      return '';
    }
  }, [routeMatch, chainsByAddr]);

  const handleSelectChain = React.useCallback((e: SelectChangeEvent<unknown>) => {
    const val = e.target.value as string;
    const newLoc = val === 'newChain' ? val : `/chains/${val}`;
    dispatch(setLocation(newLoc));
  }, [dispatch]);

  function renderMenuItems() {
    const items = Object.values(chainsByAddr).map((chain) => {
      const title = chain.name ?? chain.address;
      return (
        <MenuItem value={chain.address} key={chain.address}>{title}</MenuItem>
      );
    });

    items.push((
      <MenuItem value="newChain" key="new">New Chain</MenuItem>
    ));

    return items;
  }

  function renderSelection(value: unknown) {
    // const text = value === 'None' ? 'Select chain' : value as string;
    const text = value === 'newChain' ? 'New Chain' : 
      (!value || value === '' ? 'Select Chain' : 
        (chainsByAddr[value as string]?.name ? chainsByAddr[value as string]?.name : value as string)
      );
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
                xs: 'none',
              }
            }}
          >
            FirmSignal
          </Typography>
          {/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
          <StyledSelect
            value={value}
            onChange={handleSelectChain}
            renderValue={renderSelection}
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
              marginLeft: '0.5em',
            }}
          >
            <b>://</b>
          </Typography>
          <Search>
            <StyledInputBase
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
