import { MsgTypeName } from "firmcore";
import UpdateConfirmersForm from "../components/UpdateConfirmersForm";
import SetDirectoryForm from "../components/SetDirectoryForm";

// TODO: define the same interface for all message components
export type MsgComponent = undefined | typeof UpdateConfirmersForm;

export interface MsgTypeInfo {
  title: string,
  component: MsgComponent,
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