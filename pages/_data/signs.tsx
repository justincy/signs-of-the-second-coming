import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../../lib/Link';

export default function Signs() {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Signs
        </Typography>
        <Link href="/">Go to the main page</Link>
      </Box>
    </Container>
  );
}
