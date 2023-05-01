import { type EFMsg, type MsgTypeName } from 'firmcore'
import UpdateConfirmersForm from '../components/UpdateConfirmersForm'
import SetDirectoryForm from '../components/SetDirectoryForm'
import { type EmotionJSX } from '@emotion/react/types/jsx-namespace'
import { SetDirectoryMsg } from '../components/SetDirectoryMsg'

export interface InputError {
  what: string
}

export type MsgContent = EFMsg | InputError

export function isValidMsg (content: MsgContent): content is EFMsg {
  if ('what' in content) {
    return false
  } else {
    return true
  }
}

export interface EditMsgProps {
  id?: string
  msgNumber: number
  onChange: (msg: MsgContent) => void
}

export type MsgEditComponent = (props: EditMsgProps) => EmotionJSX.Element

export interface MsgDisplayProps {
  id?: string
  msgNumber: number
  msg: EFMsg
}

export type MsgDisplayComponent = (props: MsgDisplayProps) => EmotionJSX.Element

export interface MsgTypeInfo {
  title: string
  editComponent?: MsgEditComponent
  displayComponent?: MsgDisplayComponent
};

export const msgTypes: Record<MsgTypeName, MsgTypeInfo> = {
  efSubmitResults: {
    title: 'Breakout room results',
    editComponent: undefined
  },
  createAccount: {
    title: 'Create account',
    editComponent: undefined
  },
  removeAccount: {
    title: 'Remove account',
    editComponent: undefined
  },
  updateAccount: {
    title: 'Update account',
    editComponent: undefined
  },
  updateConfirmers: {
    title: 'Update confirmers',
    editComponent: UpdateConfirmersForm
  },
  setDir: {
    title: 'Set directory',
    editComponent: SetDirectoryForm,
    displayComponent: SetDirectoryMsg
  }
}
