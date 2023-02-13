import { TextField } from "@mui/material";

export default function SetDirectoryForm() {
  return (
    <TextField
      required
      id="name"
      label="IPFS link address"
      variant="standard"
      sx={{ minWidth: '32em' }}
    />
  );
}