import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import GroupDialog from '../../components/GroupDialog';
import DeleteDialog from '../../components/DeleteDialog';

type Group = {
  name: string;
  members: string[];
};

type Sign = {
  name: string;
  references: string[];
};

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [allSigns, setAllSigns] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);

  const fetchGroups = async () => {
    const res = await fetch('/api/groups');
    const data = await res.json();
    setGroups(data);
  };

  const fetchSigns = async () => {
    const res = await fetch('/api/signs');
    const data: Sign[] = await res.json();
    setAllSigns(data.map(s => s.name).sort());
  };

  useEffect(() => {
    fetchGroups();
    fetchSigns();
  }, []);

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.members.some(m => m.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    setEditingGroup(null);
    setDialogOpen(true);
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const handleDelete = (group: Group) => {
    setDeletingGroup(group);
    setDeleteOpen(true);
  };

  const handleSave = async (group: Group, originalName?: string) => {
    if (originalName) {
      await fetch(`/api/groups/${encodeURIComponent(originalName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group),
      });
    } else {
      await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group),
      });
    }
    fetchGroups();
  };

  const handleConfirmDelete = async () => {
    if (deletingGroup) {
      await fetch(`/api/groups/${encodeURIComponent(deletingGroup.name)}`, {
        method: 'DELETE',
      });
      setDeleteOpen(false);
      setDeletingGroup(null);
      fetchGroups();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Groups
          <Box component="span" sx={{ color: 'text.secondary', ml: 1 }}>
            ({filtered.length})
          </Box>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Group
        </Button>
      </Box>

      <TextField
        sx={{ mb: 2, width: 300 }}
        variant="outlined"
        size="small"
        placeholder="Search groups or members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Members</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((group) => (
              <TableRow key={group.name} hover>
                <TableCell sx={{ fontWeight: 500 }}>{group.name}</TableCell>
                <TableCell sx={{ maxWidth: 500 }}>
                  {group.members.slice(0, 5).map((member) => (
                    <Tooltip key={member} title={member}>
                      <Chip
                        label={member.length > 30 ? member.slice(0, 30) + '...' : member}
                        size="small"
                        sx={{ m: 0.25, maxWidth: 250 }}
                      />
                    </Tooltip>
                  ))}
                  {group.members.length > 5 && (
                    <Chip
                      label={`+${group.members.length - 5} more`}
                      size="small"
                      sx={{ m: 0.25 }}
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(group)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(group)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <GroupDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        group={editingGroup}
        allSigns={allSigns}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        signName={deletingGroup?.name || ''}
      />
    </Container>
  );
}
