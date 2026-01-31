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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SynonymDialog from '../components/SynonymDialog';
import DeleteDialog from '../components/DeleteDialog';

type Synonym = {
  duplicate: string;
  synonym: string;
};

type Sign = {
  name: string;
  references: string[];
};

export default function Synonyms() {
  const [synonyms, setSynonyms] = useState<Synonym[]>([]);
  const [allSigns, setAllSigns] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingSynonym, setEditingSynonym] = useState<Synonym | null>(null);
  const [deletingSynonym, setDeletingSynonym] = useState<Synonym | null>(null);

  const fetchSynonyms = async () => {
    const res = await fetch('/api/synonyms');
    const data = await res.json();
    setSynonyms(data);
  };

  const fetchSigns = async () => {
    const res = await fetch('/api/signs');
    const data: Sign[] = await res.json();
    setAllSigns(data.map(s => s.name).sort());
  };

  useEffect(() => {
    fetchSynonyms();
    fetchSigns();
  }, []);

  const filtered = synonyms.filter(s =>
    s.duplicate.toLowerCase().includes(search.toLowerCase()) ||
    s.synonym.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingSynonym(null);
    setDialogOpen(true);
  };

  const handleEdit = (syn: Synonym) => {
    setEditingSynonym(syn);
    setDialogOpen(true);
  };

  const handleDelete = (syn: Synonym) => {
    setDeletingSynonym(syn);
    setDeleteOpen(true);
  };

  const handleSave = async (syn: Synonym, originalDuplicate?: string) => {
    if (originalDuplicate) {
      await fetch(`/api/synonyms/${encodeURIComponent(originalDuplicate)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syn),
      });
    } else {
      await fetch('/api/synonyms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syn),
      });
    }
    fetchSynonyms();
  };

  const handleConfirmDelete = async () => {
    if (deletingSynonym) {
      await fetch(`/api/synonyms/${encodeURIComponent(deletingSynonym.duplicate)}`, {
        method: 'DELETE',
      });
      setDeleteOpen(false);
      setDeletingSynonym(null);
      fetchSynonyms();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Synonyms
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
          Add Synonym
        </Button>
      </Box>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Synonyms map duplicate or alternate sign names to their canonical sign.
      </Typography>

      <TextField
        sx={{ mb: 2, width: 300 }}
        variant="outlined"
        size="small"
        placeholder="Search synonyms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Duplicate Name</TableCell>
              <TableCell></TableCell>
              <TableCell>Canonical Sign</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((syn) => (
              <TableRow key={syn.duplicate} hover>
                <TableCell sx={{ color: 'text.secondary' }}>{syn.duplicate}</TableCell>
                <TableCell sx={{ width: 40 }}>
                  <ArrowForwardIcon fontSize="small" color="action" />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{syn.synonym}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(syn)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(syn)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SynonymDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        synonym={editingSynonym}
        allSigns={allSigns}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        signName={deletingSynonym?.duplicate || ''}
      />
    </Container>
  );
}
