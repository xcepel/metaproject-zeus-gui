import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { Flex, Group, Image, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Footer, PageContainer } from '@metacentrum/design-system';

import Loading from '@/components/global/loading';

import Navbar from '../../components/global/navbar';

const Root: React.FC = () => {
	const { t } = useTranslation();

	return (
		<>
			<Notifications />
			<Navbar />
			<Flex direction="column" mih="100vh" pt="var(--mc-header-height)">
				<Suspense fallback={<Loading />}>
					<main id="main-content" style={{ flex: 1 }}>
						<PageContainer>
							<Outlet />
						</PageContainer>
					</main>
				</Suspense>
				<Footer
					info={
						<Group gap="xs" justify="center">
							<Image src="/images/zeus.png" alt="" w={30} />
							<Text fw={500}>{t('components.global.navbar.header')}</Text>
						</Group>
					}
				/>
			</Flex>
		</>
	);
};

export default Root;
