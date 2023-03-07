import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeItem, TreeView } from "@mui/lab";
import { Box, Container, Grid } from '@mui/material';
import { Chain } from '../global/types';

export type Node = {
  name: string;
  children: Node;
}

export type ConfirmerHierarchyProps = {
  chain: Chain;
}

export default function ConfirmerHierarchy() {
  return (
    <Grid container alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
      <Grid item>
        <TreeView 
          expanded={['1', '3', '4', '5', '2', ]}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId="1" label="Parent DAO">
            <TreeItem nodeId="2" label="Child 1 DAO">
              <TreeItem nodeId="10" label="Person 1" />
              <TreeItem nodeId="11" label="Person 2" />
              <TreeItem nodeId="13" label="Person 3" />
              <TreeItem nodeId="14" label="Person 4" />
              <TreeItem nodeId="15" label="Person 5" />
            </TreeItem>

            <TreeItem nodeId="3" label="Child 2 DAO" />
            <TreeItem nodeId="4" label="Child 3 DAO" />
            <TreeItem nodeId="5" label="Child 4 DAO" />
          </TreeItem>
        </TreeView>
      </Grid>
    </Grid>

  )
}