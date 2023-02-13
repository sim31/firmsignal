import { FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import FirmActions from "./FirmActions";

export default function ConfirmForm() {
  return (
    // TODO: Adjust width of Select
    <Stack>
      <FormControl>
        <InputLabel >Chain</InputLabel>
        <Select
          id="demo-simple-select"
          label="Chain"
        >
          <MenuItem value={10}>Chain 1</MenuItem>
          <MenuItem value={20}>Chain 2</MenuItem>
          <MenuItem value={30}>Some other DAO</MenuItem>
        </Select>
      </FormControl>

      <FirmActions renderConfirm />

    </Stack>

  )
}