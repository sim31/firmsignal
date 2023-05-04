import React, { useCallback, useState } from 'react'
import { Stack, TextField } from '@mui/material'
import MessageCreateCard from './MessageCreateCard'
import type { EFBreakoutResults } from 'firmcore'
import { type EditMsgProps, msgTypes } from '../global/messages';
import type { Overwrite } from 'utility-types';
import assert from 'firmcore/src/helpers/assert';

type RanksEntryType = [string, string, string, string, string, string];

type ResultsEntry = Overwrite<EFBreakoutResults, {
  delegate: string
  ranks: RanksEntryType
}>

const emptyResult: ResultsEntry = {
  delegate: '',
  ranks: [
    '', '', '', '', '', ''
  ],
};

export default function SubmitEFResultsForm (props: EditMsgProps) {
  const [entry, setEntry] = useState<ResultsEntry>(emptyResult);
  const idStr = props.id !== undefined ? props.id : props.msgNumber.toString()
  const typeInfo = msgTypes.efSubmitResults;

  const onDelegateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEntry({
      ...entry,
      delegate: event.target.value,
    })
  }, [entry]);

  const onLevelChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    assert(index < entry.ranks.length, 'invalid index');
    const newRanks: RanksEntryType = [...entry.ranks];
    newRanks[index] = event.target.value;
    const newEntry = {
      ...entry,
      ranks: newRanks,
    };
    setEntry(newEntry);
    // TODO: Get account by name and if delegate contains a valid account and all
    // non-empty rank fields contain valid values, with no gaps, then call onChange event to the parent. Otherwise call onChange event with the InputError describing what's missing
  }, [entry]);

  function renderTextFields () {
    return [6, 5, 4, 3, 2, 1].map((rank) => {
      const index = rank - 1;
      return (
        <TextField
          required
          key={rank}
          id={`level${rank}`}
          label={`Level ${rank}`}
          variant="standard"
          sx={{ maxWidth: '14em' }}
          value={entry.ranks[index]}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onLevelChange(e, index) }}
        />
      );
    });
  }

  return (
    <MessageCreateCard idStr={idStr} title={typeInfo.title}>
      <Stack spacing={2}>

        {renderTextFields()}

        <TextField
          required
          key='delegate'
          id='delegate'
          label='Delegate'
          variant="standard"
          sx={{ maxWidth: '14em' }}
          value={entry.delegate}
          onChange={onDelegateChange}
        />
      </Stack>
    </MessageCreateCard>
  )
}
