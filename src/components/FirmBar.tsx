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



const addr1 = '0x199d5ed7f45f4ee35960cf22eade2076e95b253f';
const addr2 = '0x2e08451b79a01cda253811e45719ceb42640c20d';
const addr3 = '0xb3a3762db7ce0544b58569d5bd35a4b9284a6e96';


export default function FirmBar() {
  const [selectedChain, setSelectedChain] = React.useState<string>(addr1);

  const onSelectChain = React.useCallback((e: SelectChangeEvent<unknown>) => {
    setSelectedChain(e.target.value as string);
  }, [setSelectedChain]);

  const renderSelection = (value: unknown) => {
    // const text = value === 'None' ? 'Select chain' : value as string;
    const text = value === 'new' ? 'New chain' : value as string;
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
            value={selectedChain}
            onChange={onSelectChain}
            renderValue={renderSelection}
          >
            {/* <MenuItem value="None">Select chain</MenuItem> */}
            <MenuItem value={addr1}>{addr1}</MenuItem>
            <MenuItem value={addr2}>{addr2}</MenuItem>
            <MenuItem value={addr3}>{addr3}</MenuItem>
            <MenuItem value={'new'}>New chain</MenuItem>
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
