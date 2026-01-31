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

type Group = {
  name: string;
  members: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (group: Group, originalName?: string) => void;
  group?: Group | null;
  allSigns: string[];
};

export default function GroupDialog({ open, onClose, onSave, group, allSigns }: Props) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (group) {
      setName(group.name);
      setMembers([...group.members]);
    } else {
      setName('');
      setMembers([]);
    }
    setInputValue('');
  }, [group, open]);

  const handleAddMember = (member: string) => {
    const trimmed = member.trim();
    if (trimmed && !members.includes(trimmed)) {
      setMembers([...members, trimmed]);
    }
  };

  const handleRemoveMember = (member: string) => {
    setMembers(members.filter(m => m !== member));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), members }, group?.name);
    onClose();
  };

  // Filter out already-added members from suggestions
  const availableSigns = allSigns.filter(s => !members.includes(s));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {group ? 'Edit Group' : 'Add Group'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Members ({members.length})
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1, mb: 2, minHeight: 40 }}>
          {members.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No members yet
            </Typography>
          )}
          {members.map((member) => (
            <Chip
              key={member}
              label={member}
              onDelete={() => handleRemoveMember(member)}
              sx={{ m: 0.5 }}
              size="small"
            />
          ))}
        </Box>

        <Autocomplete
          freeSolo
          options={availableSigns}
          inputValue={inputValue}
          onInputChange={(_, value) => setInputValue(value)}
          onChange={(_, value) => {
            if (value) {
              handleAddMember(value);
              setInputValue('');
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              label="Add Member"
              placeholder="Type or select a sign"
              helperText="Select from existing signs or type a new one"
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={!name.trim()}>
          {group ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
