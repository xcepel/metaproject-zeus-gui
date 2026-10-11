import { Alert, Box, Button, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { DataTable } from 'mantine-datatable';
import dayjs from 'dayjs';
import { EmptyState } from '@metacentrum/design-system';

import { PAGE_SIZES } from '@/modules/api/pagination/constants';
import { useProjectFailedStagesQuery } from '@/modules/project/queries';
import PageBreadcrumbs from '@/components/global/page-breadcrumbs';
import { useSynchronizeProjectMutation } from '@/modules/project/mutations';
import { getProjectJob } from '@/modules/project/api/get-project-job';

const FailedProjects = () => {
	const { t } = useTranslation();
	const [loadingProject, setLoadingProject] = useState<number | null>(null);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(PAGE_SIZES[0]);

	const { data: stages, isPending, isError, refetch } = useProjectFailedStagesQuery();
	const { mutate } = useSynchronizeProjectMutation();

	if (isError) {
		return (
			<Alert color="red" mt={15} variant="light">
				{t('routes.Dashboard.error.connection')}
			</Alert>
		);
	}

	if (isPending) {
		return <Skeleton w={200} />;
	}

	const synchronizeProject = (projectId: number) => {
		if (loadingProject !== null) {
			return;
		}

		setLoadingProject(projectId);
		mutate(
			{ projectId },
			{
				onSuccess: () => {
					// not really ideal, but does the job
					const interval = setInterval(async () => {
						const isRunning = await getProjectJob(projectId);
						if (!isRunning) {
							setLoadingProject(null);
							clearInterval(interval);
							refetch();
						}
					}, 5000);
				},
				onError: () => {
					setLoadingProject(null);
				}
			}
		);
	};

	return (
		<Box>
			<PageBreadcrumbs
				links={[
					{ title: t('components.global.drawerList.links.admin.title'), href: '/admin' },
					{ title: t('components.global.drawerList.links.admin.link.stages'), href: '/admin/stages' }
				]}
			/>
			<Title order={2}>{t('routes.FailedStages.title')}</Title>
			<Box mt={15}>
				{stages.length === 0 && <EmptyState title={t('routes.FailedStages.error.noFailedStages')} />}
				{stages.length > 0 && (
					<DataTable
						records={stages}
						textSelectionDisabled
						page={page}
						totalRecords={100}
						recordsPerPage={limit}
						recordsPerPageOptions={PAGE_SIZES}
						onPageChange={async newPage => {
							setPage(newPage);
							await refetch();
						}}
						onRecordsPerPageChange={async newRecordsPerPage => {
							setLimit(newRecordsPerPage);
							await refetch();
						}}
						columns={[
							{
								accessor: 'projectId',
								title: t('routes.FailedStages.table.id'),
								width: 100
							},
							{
								accessor: 'title',
								title: t('routes.FailedStages.table.name')
							},
							{
								accessor: 'lastStage',
								width: 300,
								title: t('routes.FailedStages.table.lastStage'),
								render: stage => (
									<Stack gap={1}>
										<Text size="sm">{stage.lastStage}</Text>
										{stage.message && (
											<Text c="gray" size="xs">
												{stage.message}
											</Text>
										)}
									</Stack>
								)
							},
							{
								accessor: 'updatedAt',
								title: t('routes.FailedStages.table.updatedAt'),
								render: stage => dayjs(stage.updatedAt).format('DD.MM.YYYY HH:mm')
							},
							{
								accessor: 'actions',
								render: stage => (
									<Button
										variant="light"
										loading={stage.projectId === loadingProject}
										disabled={loadingProject !== null && loadingProject !== stage.projectId}
										onClick={() => synchronizeProject(stage.projectId)}
									>
										{t('routes.FailedStages.table.update')}
									</Button>
								)
							}
						]}
					/>
				)}
			</Box>
		</Box>
	);
};

export default FailedProjects;
