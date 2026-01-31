import * as React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link';

export type LinkProps = Omit<MuiLinkProps, 'href'> & Pick<NextLinkProps, 'href' | 'prefetch'>;

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch, ...props },
  ref
) {
  return (
    <MuiLink
      component={NextLink}
      href={href}
      prefetch={prefetch}
      ref={ref}
      {...props}
    />
  );
});

export default Link;
