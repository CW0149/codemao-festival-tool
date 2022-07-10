import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { FC, ReactChild } from 'react';

export type AlertProps = {
  open: boolean;
  setOpen: (open: boolean) => () => void;
  title?: string;
  description?: string;
  dialogActions?: ReactChild;
};
const AlertDialog: FC<AlertProps> = ({
  open,
  setOpen,
  title,
  description,
  dialogActions,
}) => {
  return (
    <Dialog
      open={open}
      onClose={setOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      {dialogActions && <DialogActions>{dialogActions}</DialogActions>}
    </Dialog>
  );
};

export default AlertDialog;
