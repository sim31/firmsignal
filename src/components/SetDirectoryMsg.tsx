import { Grid, Link } from "@mui/material";
import MessageCard from "./MessageCard";
import { MsgDisplayProps, msgTypes } from "../global/messages";


export function SetDirectoryMsg({ msg, msgNumber, id } : MsgDisplayProps) {
  const typeInfo = msgTypes['setDir'];
  const dirId = 'dir' in msg ? msg.dir : 'Error: bad props passed';
  const idStr = id ? id : msgNumber.toString(); 
  return (
    <Grid item>
      {/* TODO: pass full hash? */}
      <MessageCard id={idStr} title={typeInfo.title}>
        <Link>ipfs://{dirId}</Link>
      </MessageCard>
    </Grid>
  )
}