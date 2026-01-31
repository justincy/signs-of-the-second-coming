import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    marginBottom: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  card: {
    height: '100%',
  },
  cardTitle: {
    fontWeight: 500,
  },
  cardDesc: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
}));

const sections = [
  {
    title: 'Signs',
    description: 'View and manage the signs of the Second Coming',
    href: '/signs',
    ready: true,
  },
  {
    title: 'Relationships',
    description: 'Edit before/after relationships between signs',
    href: '/relationships',
    ready: false,
  },
  {
    title: 'Synonyms',
    description: 'Manage duplicate sign mappings',
    href: '/synonyms',
    ready: false,
  },
  {
    title: 'Groups',
    description: 'Organize signs into logical clusters',
    href: '/groups',
    ready: false,
  },
];

export default function Home() {
  const classes = useStyles();

  return (
    <Container maxWidth="md" className={classes.root}>
      <Typography variant="h3" className={classes.title}>
        Signs of the Second Coming
      </Typography>
      <Typography variant="body1" className={classes.subtitle}>
        Editor for managing signs, relationships, and scripture references
      </Typography>

      <Grid container spacing={3}>
        {sections.map((section) => (
          <Grid item xs={12} sm={6} key={section.title}>
            <Card className={classes.card} variant="outlined">
              {section.ready ? (
                <Link href={section.href} passHref>
                  <CardActionArea component="a">
                    <CardContent>
                      <Typography variant="h6" className={classes.cardTitle}>
                        {section.title}
                      </Typography>
                      <Typography variant="body2" className={classes.cardDesc}>
                        {section.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              ) : (
                <CardContent style={{ opacity: 0.5 }}>
                  <Typography variant="h6" className={classes.cardTitle}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" className={classes.cardDesc}>
                    {section.description}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Coming soon
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
