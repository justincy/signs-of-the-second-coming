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
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Relationship = {
  before: string;
  after: string;
  references: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (rel: Relationship, originalBefore?: string, originalAfter?: string) => void;
  relationship?: Relationship | null;
  signNames: string[];
};

export default function RelationshipDialog({
  open,
  onClose,
  onSave,
  relationship,
  signNames,
}: Props) {
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [newRef, setNewRef] = useState('');

  useEffect(() => {
    if (relationship) {
      setBefore(relationship.before);
      setAfter(relationship.after);
      setReferences([...relationship.references]);
    } else {
      setBefore('');
      setAfter('');
      setReferences([]);
    }
    setNewRef('');
  }, [relationship, open]);

  const handleAddRef = () => {
    const trimmed = newRef.trim();
    if (trimmed && !references.includes(trimmed)) {
      setReferences([...references, trimmed]);
      setNewRef('');
    }
  };

  const handleRemoveRef = (ref: string) => {
    setReferences(references.filter((r) => r !== ref));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRef();
    }
  };

  const handleSave = () => {
    if (!before.trim() || !after.trim()) return;
    onSave(
      { before: before.trim(), after: after.trim(), references },
      relationship?.before,
      relationship?.after
    );
    onClose();
  };

  const isValid = before.trim() && after.trim() && before.trim() !== after.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {relationship ? 'Edit Relationship' : 'Add Relationship'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Autocomplete
          freeSolo
          options={signNames}
          value={before}
          onInputChange={(_, value) => setBefore(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              margin="dense"
              label="Before (this happens first)"
              fullWidth
            />
          )}
        />

        <Autocomplete
          freeSolo
          options={signNames}
          value={after}
          onInputChange={(_, value) => setAfter(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              label="After (this happens second)"
              fullWidth
            />
          )}
        />

        {before && after && before === after && (
          <Typography color="error" variant="caption">
            "Before" and "After" cannot be the same sign
          </Typography>
        )}

        <Typography variant="subtitle2" sx={{ mt: 3 }}>
          Scripture References ({references.length})
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1, mb: 2 }}>
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
              sx={{ m: 0.5 }}
              size="small"
            />
          ))}
        </Box>

        <TextField
          sx={{ mt: 1 }}
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
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={!isValid}
        >
          {relationship ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
