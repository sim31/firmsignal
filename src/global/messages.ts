import { EFMsg, MsgTypeName } from "firmcore";
import UpdateConfirmersForm from "../components/UpdateConfirmersForm";
import SetDirectoryForm from "../components/SetDirectoryForm";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";

export interface InputError {
  what: string;
}

export type MsgContent = EFMsg | InputError;

export function isValidMsg(content: MsgContent): content is EFMsg {
  if ('what' in content) {
    return false;
  } else {
    return true;
  }
}

export interface CreateMsgProps {
  onChange: (msg: MsgContent) => void;
}

export type MsgComponent = (props: CreateMsgProps) => EmotionJSX.Element;

export interface MsgTypeInfo {
  title: string,
  component?: MsgComponent,
};

export const msgTypes: Record<MsgTypeName, MsgTypeInfo> = {
  'efSubmitResults': {
    title: 'Breakout room results',
    component: undefined
  },
  'createAccount': {
    title: 'Create account',
    component: undefined
  },
  'removeAccount': {
    title: 'Remove account',
    component: undefined,
  },
  'updateAccount': {
    title: 'Update account',
    component: undefined,
  },
  'updateConfirmers': {
    title: 'Update confirmers',
    component: UpdateConfirmersForm,
  },
  'setDir': {
    title: 'Set directory',
    component: SetDirectoryForm,
  }
};