import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Autocomplete,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Synonym = {
  duplicate: string;
  synonym: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (syn: Synonym, originalDuplicate?: string) => void;
  synonym?: Synonym | null;
  allSigns: string[];
};

export default function SynonymDialog({ open, onClose, onSave, synonym, allSigns }: Props) {
  const [duplicate, setDuplicate] = useState('');
  const [canonicalSign, setCanonicalSign] = useState('');

  useEffect(() => {
    if (synonym) {
      setDuplicate(synonym.duplicate);
      setCanonicalSign(synonym.synonym);
    } else {
      setDuplicate('');
      setCanonicalSign('');
    }
  }, [synonym, open]);

  const handleSave = () => {
    if (!duplicate.trim() || !canonicalSign.trim()) return;
    onSave(
      { duplicate: duplicate.trim(), synonym: canonicalSign.trim() },
      synonym?.duplicate
    );
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {synonym ? 'Edit Synonym' : 'Add Synonym'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Map a duplicate/alternate sign name to its canonical sign.
        </Typography>

        <TextField
          autoFocus
          margin="dense"
          label="Duplicate Name"
          placeholder="The alternate or duplicate sign name"
          fullWidth
          value={duplicate}
          onChange={(e) => setDuplicate(e.target.value)}
        />

        <Autocomplete
          freeSolo
          options={allSigns}
          value={canonicalSign}
          onChange={(_, value) => setCanonicalSign(value || '')}
          onInputChange={(_, value) => setCanonicalSign(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              label="Maps To (Canonical Sign)"
              placeholder="The canonical sign this maps to"
              helperText="Select from existing signs or type a new one"
            />
          )}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={!duplicate.trim() || !canonicalSign.trim()}
        >
          {synonym ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
