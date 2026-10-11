import { Anchor, Breadcrumbs } from '@mantine/core';
import { Link } from 'react-router-dom';

type BreadCrumbLink = {
	title: string;
	href: string;
};

type PageBreadcrumbProps = {
	links: BreadCrumbLink[];
};

const PageBreadcrumbs = ({ links }: PageBreadcrumbProps) => {
	const items = links.map(({ title, href }) => (
		<Anchor key={href} component={Link} to={href}>
			{title}
		</Anchor>
	));
	return (
		<Breadcrumbs mb={20} separatorMargin="md">
			{items}
		</Breadcrumbs>
	);
};

export default PageBreadcrumbs;
