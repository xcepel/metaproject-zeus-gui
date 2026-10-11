import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box } from '@mantine/core';
import { IconActivity, IconArchive, IconBan, IconClockQuestion, IconPlus } from '@tabler/icons-react';
import { Button, PageHeader, Tabs } from '@metacentrum/design-system';

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
					<Button href="add" linkAs={RouterLink} icon={<IconPlus />}>
						{t('routes.Dashboard.requestButton')}
					</Button>
				}
			/>
			<Tabs
				aria-label={t('routes.Dashboard.title')}
				selected={currentTab ?? 'active'}
				onChange={activateTab}
				tabs={[
					{
						id: 'active',
						label: t('routes.Dashboard.activeProjects.title'),
						icon: <IconActivity />,
						content: activeClicked && (
							<ProjectTable
								title={t('routes.Dashboard.activeProjects.title')}
								status={ProjectStatus.ACTIVE}
							/>
						)
					},
					{
						id: 'requested',
						label: t('routes.Dashboard.requestedProjects.title'),
						icon: <IconClockQuestion />,
						content: requestedClicked && (
							<ProjectTable
								title={t('routes.Dashboard.requestedProjects.title')}
								status={ProjectStatus.NEW}
							/>
						)
					},
					{
						id: 'archived',
						label: t('routes.Dashboard.archivedProjects.title'),
						icon: <IconArchive />,
						content: archivedClicked && (
							<ProjectTable
								title={t('routes.Dashboard.archivedProjects.title')}
								status={ProjectStatus.ARCHIVED}
							/>
						)
					},
					{
						id: 'rejected',
						label: t('routes.Dashboard.rejectedProjects.title'),
						icon: <IconBan />,
						content: rejectedClicked && (
							<ProjectTable
								title={t('routes.Dashboard.rejectedProjects.title')}
								status={ProjectStatus.REJECTED}
							/>
						)
					}
				]}
			/>
		</Box>
	);
};

export default Project;
