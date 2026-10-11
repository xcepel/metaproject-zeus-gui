import { Box, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Button, DataTable, type DataTableColumn } from '@metacentrum/design-system';

import { PAGE_SIZES } from '@/modules/api/pagination/constants';
import { useProjectFailedStagesQuery } from '@/modules/project/queries';
import PageBreadcrumbs from '@/components/global/page-breadcrumbs';
import { useSynchronizeProjectMutation } from '@/modules/project/mutations';
import { getProjectJob } from '@/modules/project/api/get-project-job';
import type { ProjectFailedStage } from '@/modules/project/model';

const FailedProjects = () => {
	const { t } = useTranslation();
	const [loadingProject, setLoadingProject] = useState<number | null>(null);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(PAGE_SIZES[0]);

	const { data: stages, isPending, isError, refetch } = useProjectFailedStagesQuery();
	const { mutate } = useSynchronizeProjectMutation();

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

	const columns: DataTableColumn<ProjectFailedStage>[] = [
		{
			key: 'projectId',
			header: t('routes.FailedStages.table.id'),
			width: '100px'
		},
		{
			key: 'title',
			header: t('routes.FailedStages.table.name')
		},
		{
			key: 'lastStage',
			header: t('routes.FailedStages.table.lastStage'),
			width: '300px',
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
			key: 'updatedAt',
			header: t('routes.FailedStages.table.updatedAt'),
			render: stage => dayjs(stage.updatedAt).format('DD.MM.YYYY HH:mm')
		},
		{
			key: 'actions',
			header: '',
			render: stage => (
				<Button
					variant="secondary"
					loading={stage.projectId === loadingProject}
					disabled={loadingProject !== null && loadingProject !== stage.projectId}
					onClick={() => synchronizeProject(stage.projectId)}
				>
					{t('routes.FailedStages.table.update')}
				</Button>
			)
		}
	];

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
				<DataTable
					columns={columns}
					rows={stages ?? []}
					rowKey={stage => stage.projectId}
					loading={isPending}
					error={isError ? { title: t('routes.Dashboard.error.connection') } : undefined}
					emptyTitle={t('routes.FailedStages.error.noFailedStages')}
					pagination={{
						page,
						pageSize: limit,
						totalItems: 100,
						pageSizes: PAGE_SIZES,
						onChange: async ({ page: nextPage, pageSize }) => {
							setPage(nextPage);
							setLimit(pageSize);
							await refetch();
						}
					}}
				/>
			</Box>
		</Box>
	);
};

export default FailedProjects;
