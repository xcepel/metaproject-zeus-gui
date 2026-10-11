import { Box } from '@mantine/core';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { resolvePath, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type UseQueryResult } from '@tanstack/react-query';
import { DataTable, type DataTableColumn, type DataTableSort } from '@metacentrum/design-system';

import { PAGE_SIZES } from '@/modules/api/pagination/constants';
import { strip } from '@/modules/html/strip';
import { type PaginationResponse } from '@/modules/api/pagination/model';
import { type Project } from '@/modules/project/model';

type ProjectAdminTableProps = {
	useProjectQuery: (
		page: number,
		limit: number,
		sort: DataTableSort
	) => UseQueryResult<PaginationResponse<Project>, Error>;
	buildLink: (project: Project) => string;
};

const ProjectAdminTable = ({ useProjectQuery, buildLink }: ProjectAdminTableProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(PAGE_SIZES[0]);
	const [sort, setSort] = useState<DataTableSort>({ key: 'id', direction: 'asc' });

	// Query key includes page/limit/sort, so state changes refetch.
	const { data: response, isPending, isError } = useProjectQuery(page, limit, sort);

	const metadata = response?.metadata ?? { totalRecords: 0, currentPage: 1 };
	const projects = response?.data ?? [];

	const columns: DataTableColumn<Project>[] = [
		{
			key: 'id',
			header: t('routes.Dashboard.table.id'),
			width: '70px',
			sortable: true
		},
		{
			key: 'title',
			header: t('routes.Dashboard.table.name'),
			sortable: true
		},
		{
			key: 'description',
			width: '300px',
			header: t('routes.Dashboard.table.description'),
			render: project => {
				const stripped = strip(project.description);
				return stripped.length > 50 ? `${stripped.slice(0, 50)}...` : stripped;
			}
		},
		{
			key: 'pi',
			header: t('routes.ProjectRequests.table.pi'),
			render: project => project.user.name
		},
		{
			key: 'createdAt',
			header: t('routes.ProjectRequests.table.createdAt'),
			render: project => dayjs(project.createdAt).format('DD.MM.YYYY HH:mm')
		}
	];

	return (
		<Box mt={15}>
			<DataTable
				columns={columns}
				rows={projects}
				rowKey={project => project.id}
				onRowClick={(project, e) => {
					const href = buildLink(project);
					if (e.ctrlKey || e.metaKey || ('button' in e && e.button === 1)) {
						// buildLink may be relative; resolve it against the current path.
						window.open(resolvePath(href, location.pathname).pathname, '_blank');
					} else navigate(href);
				}}
				sort={sort}
				onSortChange={setSort}
				loading={isPending}
				error={isError ? { title: t('routes.Dashboard.error.connection') } : undefined}
				emptyTitle={t('components.projectTable.admin.noProjects')}
				pagination={{
					page,
					pageSize: limit,
					totalItems: metadata.totalRecords,
					pageSizes: PAGE_SIZES,
					onChange: ({ page: nextPage, pageSize }) => {
						setPage(nextPage);
						setLimit(pageSize);
					}
				}}
			/>
		</Box>
	);
};

export default ProjectAdminTable;
