import { AlertColor } from "@mui/material";


export type ActionStatus =
  | 'finalized'
  | 'proposed';

export function actionTagsStr(actionStatus: ActionStatus) {
  return `action ${actionStatus}`;
}

export function actionHeaderStr(actionId: string, actionStatus: ActionStatus) {
  return `#${actionId} ${actionTagsStr(actionStatus)}`;
}

export type StatusAlert = {
  status: AlertColor | 'none';
  msg: string;
}

