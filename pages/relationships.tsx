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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RelationshipDialog from '../components/RelationshipDialog';
import DeleteDialog from '../components/DeleteDialog';

type Relationship = {
  before: string;
  after: string;
  references: string[];
};

type Sign = {
  name: string;
  references: string[];
};

export default function Relationships() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [signs, setSigns] = useState<Sign[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Relationship | null>(null);
  const [deleting, setDeleting] = useState<Relationship | null>(null);

  const fetchRelationships = async () => {
    const res = await fetch('/api/relationships');
    const data = await res.json();
    setRelationships(data);
  };

  const fetchSigns = async () => {
    const res = await fetch('/api/signs');
    const data = await res.json();
    setSigns(data);
  };

  useEffect(() => {
    fetchRelationships();
    fetchSigns();
  }, []);

  const signNames = signs.map((s) => s.name);

  const filtered = relationships.filter(
    (r) =>
      r.before.toLowerCase().includes(search.toLowerCase()) ||
      r.after.toLowerCase().includes(search.toLowerCase()) ||
      r.references.some((ref) => ref.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (rel: Relationship) => {
    setEditing(rel);
    setDialogOpen(true);
  };

  const handleDelete = (rel: Relationship) => {
    setDeleting(rel);
    setDeleteOpen(true);
  };

  const handleSave = async (
    rel: Relationship,
    originalBefore?: string,
    originalAfter?: string
  ) => {
    if (originalBefore && originalAfter) {
      // Update
      await fetch(
        `/api/relationships/${encodeURIComponent(originalBefore)}/${encodeURIComponent(
          originalAfter
        )}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rel),
        }
      );
    } else {
      // Create
      await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rel),
      });
    }
    fetchRelationships();
  };

  const handleConfirmDelete = async () => {
    if (deleting) {
      await fetch(
        `/api/relationships/${encodeURIComponent(deleting.before)}/${encodeURIComponent(
          deleting.after
        )}`,
        { method: 'DELETE' }
      );
      setDeleteOpen(false);
      setDeleting(null);
      fetchRelationships();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4">
          Relationships
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
          Add Relationship
        </Button>
      </Box>

      <TextField
        sx={{ mb: 2, width: 350 }}
        variant="outlined"
        size="small"
        placeholder="Search signs or references..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Before</TableCell>
              <TableCell sx={{ width: 50 }}></TableCell>
              <TableCell>After</TableCell>
              <TableCell>References</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((rel) => (
              <TableRow key={`${rel.before}|||${rel.after}`} hover>
                <TableCell sx={{ fontWeight: 500 }}>{rel.before}</TableCell>
                <TableCell>
                  <ArrowForwardIcon fontSize="small" color="action" />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{rel.after}</TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  {rel.references.slice(0, 3).map((ref) => (
                    <Tooltip key={ref} title={ref}>
                      <Chip
                        label={ref.length > 20 ? ref.slice(0, 20) + '...' : ref}
                        size="small"
                        sx={{ m: 0.25 }}
                      />
                    </Tooltip>
                  ))}
                  {rel.references.length > 3 && (
                    <Chip
                      label={`+${rel.references.length - 3} more`}
                      size="small"
                      sx={{ m: 0.25 }}
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(rel)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(rel)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <RelationshipDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        relationship={editing}
        signNames={signNames}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        signName={deleting ? `${deleting.before} → ${deleting.after}` : ''}
      />
    </Container>
  );
}
