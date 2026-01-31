import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import { GetStaticProps } from 'next';
import signsData from '../data/signs.json';

interface Sign {
  name: string;
  references: string[];
}

interface Props {
  signs: Sign[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      signs: signsData as Sign[],
    },
  };
};

export default function SignsPage({ signs }: Props) {
  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Signs
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        {signs.length} signs with scripture references
      </Typography>

      <Stack spacing={2}>
        {signs.map((sign) => (
          <Card key={sign.name} variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {sign.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {sign.references.map((ref, i) => (
                  <Chip
                    key={i}
                    label={ref}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
