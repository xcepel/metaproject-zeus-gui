import { useRouteError } from 'react-router-dom';
import React from 'react';
import { Container, Group, Text, Title } from '@mantine/core';
import { Button } from '@metacentrum/design-system';

import RouterLink from '@/components/global/router-link';

import classes from './error.module.css';

const ErrorPage: React.FC = () => {
	const error = useRouteError() as { statusText: string; message: string };

	return (
		<Container className={classes.root}>
			<div className={classes.inner}>
				<div className={classes.content}>
					<Title className={classes.title}>Error</Title>
					{error?.statusText && error?.message && (
						<Text c="dimmed" ta="center">
							{error?.statusText}: {error?.message}
						</Text>
					)}
					<Text c="dimmed" size="lg" ta="center" className={classes.description}>
						Error occurred while loading the page. Please try again later.
					</Text>
					<Group justify="center">
						<Button variant="primary" href="/" linkAs={RouterLink}>
							Take me back to home page
						</Button>
					</Group>
				</div>
			</div>
		</Container>
	);
};

export default ErrorPage;
