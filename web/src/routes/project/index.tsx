import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Tabs } from '@mantine/core';
import { IconActivity, IconArchive, IconBan, IconClockQuestion, IconPlus } from '@tabler/icons-react';
import { PageHeader } from '@metacentrum/design-system';

import RouterLink from '@/components/global/router-link';
import ProjectTable from '@/components/project/project-table';
import { ProjectStatus } from '@/modules/project/constants';

const STATUSES = ['active', 'requested', 'archived', 'rejected'];

const Project: React.FC = () => {
	const [params, setSearchParams] = useSearchParams();

	const paramsStatus = params.get('status');
	const defaultValue = paramsStatus && STATUSES.includes(paramsStatus) ? paramsStatus : 'active';
	const { t } = useTranslation();

	// only load other types of project after clicking on tab
	const [currentTab, setCurrentTab] = useState<string | null>(defaultValue);
	const [activeClicked, setActiveClicked] = useState(defaultValue === 'active');
	const [requestedClicked, setRequestedClicked] = useState(defaultValue === 'requested');
	const [archivedClicked, setArchivedClicked] = useState(defaultValue === 'archived');
	const [rejectedClicked, setRejectedClicked] = useState(defaultValue === 'rejected');

	useEffect(() => {
		activateTab(params.get('status') ?? 'active');
	}, [params.get('status')]);

	const activateTab = (status: string) => {
		if (!STATUSES.includes(status)) {
			return;
		}

		setCurrentTab(status);
		setSearchParams({
			status
		});
		switch (status) {
			case 'active':
				setActiveClicked(true);
				break;
			case 'requested':
				setRequestedClicked(true);
				break;
			case 'archived':
				setArchivedClicked(true);
				break;
			case 'rejected':
				setRejectedClicked(true);
				break;
		}
	};

	return (
		<Box w="100%">
			<PageHeader
				title={t('routes.Dashboard.title')}
				linkAs={RouterLink}
				actions={
					<Button component={Link} to="add" variant="contained" leftSection={<IconPlus />}>
						{t('routes.Dashboard.requestButton')}
					</Button>
				}
			/>
			<Tabs value={currentTab} onChange={setCurrentTab}>
				<Tabs.List>
					<Tabs.Tab onClick={() => activateTab('active')} value="active" leftSection={<IconActivity />}>
						{t('routes.Dashboard.activeProjects.title')}
					</Tabs.Tab>
					<Tabs.Tab
						onClick={() => activateTab('requested')}
						value="requested"
						leftSection={<IconClockQuestion />}
					>
						{t('routes.Dashboard.requestedProjects.title')}
					</Tabs.Tab>
					<Tabs.Tab
						onClick={() => activateTab('archived')}
						value="archived"
						leftSection={<IconArchive />}
					>
						{t('routes.Dashboard.archivedProjects.title')}
					</Tabs.Tab>
					<Tabs.Tab onClick={() => activateTab('rejected')} value="rejected" leftSection={<IconBan />}>
						{t('routes.Dashboard.rejectedProjects.title')}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="active">
					{activeClicked && (
						<ProjectTable
							title={t('routes.Dashboard.activeProjects.title')}
							status={ProjectStatus.ACTIVE}
						/>
					)}
				</Tabs.Panel>

				<Tabs.Panel value="requested">
					{requestedClicked && (
						<ProjectTable
							title={t('routes.Dashboard.requestedProjects.title')}
							status={ProjectStatus.NEW}
						/>
					)}
				</Tabs.Panel>

				<Tabs.Panel value="archived">
					{archivedClicked && (
						<ProjectTable
							title={t('routes.Dashboard.archivedProjects.title')}
							status={ProjectStatus.ARCHIVED}
						/>
					)}
				</Tabs.Panel>

				<Tabs.Panel value="rejected">
					{rejectedClicked && (
						<ProjectTable
							title={t('routes.Dashboard.rejectedProjects.title')}
							status={ProjectStatus.REJECTED}
						/>
					)}
				</Tabs.Panel>
			</Tabs>
		</Box>
	);
};

export default Project;
