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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import SignDialog from '../components/SignDialog';
import DeleteDialog from '../components/DeleteDialog';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  search: {
    marginBottom: theme.spacing(2),
    width: 300,
  },
  chip: {
    margin: theme.spacing(0.25),
    maxWidth: 200,
  },
  refCell: {
    maxWidth: 400,
  },
  nameCell: {
    fontWeight: 500,
  },
  count: {
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1),
  },
}));

type Sign = {
  name: string;
  references: string[];
};

export default function Signs() {
  const classes = useStyles();
  const [signs, setSigns] = useState<Sign[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingSign, setEditingSign] = useState<Sign | null>(null);
  const [deletingSign, setDeletingSign] = useState<Sign | null>(null);

  const fetchSigns = async () => {
    const res = await fetch('/api/signs');
    const data = await res.json();
    setSigns(data);
  };

  useEffect(() => {
    fetchSigns();
  }, []);

  const filtered = signs.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.references.some(r => r.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    setEditingSign(null);
    setDialogOpen(true);
  };

  const handleEdit = (sign: Sign) => {
    setEditingSign(sign);
    setDialogOpen(true);
  };

  const handleDelete = (sign: Sign) => {
    setDeletingSign(sign);
    setDeleteOpen(true);
  };

  const handleSave = async (sign: Sign, originalName?: string) => {
    if (originalName) {
      // Update
      await fetch(`/api/signs/${encodeURIComponent(originalName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sign),
      });
    } else {
      // Create
      await fetch('/api/signs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sign),
      });
    }
    fetchSigns();
  };

  const handleConfirmDelete = async () => {
    if (deletingSign) {
      await fetch(`/api/signs/${encodeURIComponent(deletingSign.name)}`, {
        method: 'DELETE',
      });
      setDeleteOpen(false);
      setDeletingSign(null);
      fetchSigns();
    }
  };

  return (
    <Container maxWidth="lg" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Box className={classes.header}>
        <Typography variant="h4">
          Signs
          <span className={classes.count}>({filtered.length})</span>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Sign
        </Button>
      </Box>

      <TextField
        className={classes.search}
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
              <TableCell>Name</TableCell>
              <TableCell>References</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((sign) => (
              <TableRow key={sign.name} hover>
                <TableCell className={classes.nameCell}>{sign.name}</TableCell>
                <TableCell className={classes.refCell}>
                  {sign.references.slice(0, 5).map((ref) => (
                    <Tooltip key={ref} title={ref}>
                      <Chip
                        label={ref.length > 25 ? ref.slice(0, 25) + '...' : ref}
                        size="small"
                        className={classes.chip}
                      />
                    </Tooltip>
                  ))}
                  {sign.references.length > 5 && (
                    <Chip
                      label={`+${sign.references.length - 5} more`}
                      size="small"
                      className={classes.chip}
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(sign)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(sign)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SignDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        sign={editingSign}
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        signName={deletingSign?.name || ''}
      />
    </Container>
  );
}
