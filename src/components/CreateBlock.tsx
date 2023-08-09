import { Button, Grid, Stack, Typography } from '@mui/material'
import { useAppDispatch, useLatestBlocks } from '../global/hooks.js'
import { createBlock } from '../global/slices/chains.js'
import { useCallback, useState } from 'react'
import React, { type MsgTypeName } from 'firmcore'
import useIncrementingId from '../hooks/useIncrementingId.js'
import { SelectMsgTypeDialog } from './SelectMsgTypeDialog.js'
import { type MsgContent, isValidMsg, msgTypes } from '../global/messages.js'
import { ProgrammingError } from 'firmcore/src/exceptions/ProgrammingError.js'
import { setStatusAlert, unsetAlert } from '../global/slices/status.js'
import { NotFound } from 'firmcore/src/exceptions/NotFound.js'
import { setLocation } from '../global/slices/appLocation.js'

type MsgId = string
type MsgEntry = MsgContent & { id: MsgId, typeName: MsgTypeName }

export default function CreateBlock () {
  const { headBlock, chain } = useLatestBlocks()
  const height = (headBlock != null) ? headBlock.height + 1 : undefined
  const [msgs, setMsgs] = useState<Record<MsgId, MsgEntry>>({})
  const newMsgId = useIncrementingId('msg')
  const [newMsgOpen, setNewMsgOpen] = useState<boolean>(false)
  const dispatch = useAppDispatch()

  const onAddMsg = useCallback(() => {
    setNewMsgOpen(true)
  }, [])

  const newMsgEntry = useCallback<(type: MsgTypeName) => MsgEntry>((type: MsgTypeName) => {
    return {
      id: newMsgId(),
      typeName: type,
      what: 'Not filled'
    }
  }, [newMsgId])

  const onNewMsgClose = useCallback((typeName?: MsgTypeName) => {
    setNewMsgOpen(false)
    if (typeName !== undefined) {
      const newEntry = newMsgEntry(typeName)
      setMsgs({ ...msgs, [newEntry.id]: newEntry })
    }
  }, [newMsgEntry, msgs, setNewMsgOpen])

  const onMsgChange = useCallback((id: MsgId, content: MsgContent) => {
    const currentMsg = msgs[id]
    if (currentMsg == null) {
      throw new ProgrammingError(`msg entry with id ${id} does not exist`)
    }
    setMsgs({
      ...msgs,
      [id]: { ...content, id, typeName: currentMsg.typeName }
    })
  }, [msgs, setMsgs])

  const onSubmit = useCallback(
    async () => {
      // FIXME: all of this logic should probably be in thunks

      // TODO: Show error if not enough information (like threshold not set)
      try {
        // TODO: Higher order thunk which sets the status message and handles errors
        // TODO: Spinner
        dispatch(setStatusAlert({
          status: 'info',
          msg: 'Creating firmchain...'
        }))

        if (chain === undefined || chain === undefined) {
          throw new NotFound('Chain not found')
        }

        const ms = Object.values(msgs).map(m => {
          if (isValidMsg(m)) {
            return m
          } else {
            throw new Error(m.what)
          }
        })

        const args = { chainAddr: chain.address, msgs: ms }
        await dispatch(createBlock(args)).unwrap()
        dispatch(unsetAlert())
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        dispatch(setLocation(`/chains/${chain.address}`))
      } catch (err) {
        console.log(err)
        const msg =
          typeof err === 'object' && (err != null) && 'message' in err && typeof err.message === 'string' ? err.message : err
        dispatch(setStatusAlert({
          status: 'error',
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          msg: `Failed creating new block. Error: ${msg}`
        }))
      }
    }, [msgs, dispatch, chain])

  function renderMessages () {
    // TODO: issue a token?
    const rMsgs = Object.values(msgs).map((msg, index) => {
      const typeInfo = msgTypes[msg.typeName]
      const Component = typeInfo.editComponent
      if (Component != null) {
        return (
          <Grid item key={msg.id}>
            <Component msgNumber={index + 1} onChange={(m) => { onMsgChange(msg.id, m) }}/>
          </Grid>
        )
      } else {
        return null
      }
    })

    return (
      <Grid container spacing={4} sx={{ mt: 0, paddingRight: 2 }}>
        {rMsgs}
      </Grid>

    )
  }

  return (
    <>
      <Grid container spacing={2} sx={{ mt: 1, mr: 2, ml: 2 }}>

        <Grid item>
          <Button size="large" onClick={onAddMsg}>Add Message</Button>
        </Grid>

        <Grid item>
          {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            <Button size="large" onClick={onSubmit}>Submit</Button>
          }
        </Grid>

        <Grid item xs>
          <Stack direction='row' spacing={8} justifyContent='flex-end'>
            <Typography component="span" color="text.secondary">
              Block number: {height}
            </Typography>

            <Typography component="span" color="text.secondary">
              Messages: {Object.entries(msgs).length}
            </Typography>

          </Stack>

          {renderMessages()}
        </Grid>

      </Grid>

      <SelectMsgTypeDialog open={newMsgOpen} onClose={onNewMsgClose} />

    </>
  )
}
