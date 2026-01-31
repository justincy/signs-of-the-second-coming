import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Box,
  Typography,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  chip: {
    margin: theme.spacing(0.5),
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  refInput: {
    marginTop: theme.spacing(2),
  },
}));

type Sign = {
  name: string;
  references: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (sign: Sign, originalName?: string) => void;
  sign?: Sign | null;
};

export default function SignDialog({ open, onClose, onSave, sign }: Props) {
  const classes = useStyles();
  const [name, setName] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [newRef, setNewRef] = useState('');

  useEffect(() => {
    if (sign) {
      setName(sign.name);
      setReferences([...sign.references]);
    } else {
      setName('');
      setReferences([]);
    }
    setNewRef('');
  }, [sign, open]);

  const handleAddRef = () => {
    const trimmed = newRef.trim();
    if (trimmed && !references.includes(trimmed)) {
      setReferences([...references, trimmed]);
      setNewRef('');
    }
  };

  const handleRemoveRef = (ref: string) => {
    setReferences(references.filter(r => r !== ref));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRef();
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), references }, sign?.name);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {sign ? 'Edit Sign' : 'Add Sign'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Sign Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        <Typography variant="subtitle2" style={{ marginTop: 16 }}>
          Scripture References ({references.length})
        </Typography>
        
        <Box className={classes.chipContainer}>
          {references.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No references yet
            </Typography>
          )}
          {references.map((ref) => (
            <Chip
              key={ref}
              label={ref}
              onDelete={() => handleRemoveRef(ref)}
              className={classes.chip}
              size="small"
            />
          ))}
        </Box>

        <TextField
          className={classes.refInput}
          margin="dense"
          label="Add Reference"
          placeholder="e.g., D&C 45:26-27"
          fullWidth
          value={newRef}
          onChange={(e) => setNewRef(e.target.value)}
          onKeyDown={handleKeyDown}
          helperText="Press Enter to add"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={!name.trim()}>
          {sign ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
