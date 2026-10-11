import { type AnchorHTMLAttributes, forwardRef } from 'react';
import { Link } from 'react-router-dom';

/** For design-system `linkAs` props. */
const RouterLink = forwardRef<HTMLAnchorElement, { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>>(
	({ href, ...rest }, ref) => <Link ref={ref} to={href} {...rest} />
);
RouterLink.displayName = 'RouterLink';

export default RouterLink;
