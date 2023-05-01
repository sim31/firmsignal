import React from 'react'
import { TreeItem, TreeView } from '@mui/lab'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { styled } from '@mui/material/styles'

const StyledItem = styled(TreeItem)({
  '& .MuiTreeItem-content': {
    padding: 0
  }
})

export default function IssueTokenMsg () {
  // sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
  return (
    <TreeView
      expanded={['1', '5', '6']}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      <StyledItem nodeId="1" label="Receiver">
        <StyledItem nodeId="2" label="Tadas" />
      </StyledItem>
      <StyledItem nodeId="5" label="Amount">
        <StyledItem nodeId="10" label="56" />
      </StyledItem>
    </TreeView>
  )
}
