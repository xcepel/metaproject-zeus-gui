import { Box, Title } from '@mantine/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DataTable, type DataTableColumn, type DataTableSort } from '@metacentrum/design-system';

import { PAGE_SIZES } from '@/modules/api/pagination/constants';
import { type ProjectStatus } from '@/modules/project/constants';
import { useProjectsQuery } from '@/modules/project/queries';
import type { Project } from '@/modules/project/model';
import { getSortQuery } from '@/modules/api/sorting/utils';
import { strip } from '@/modules/html/strip';

type ProjectTableProps = {
	title: string;
	status: ProjectStatus;
};

const ProjectTable = ({ status, title }: ProjectTableProps) => {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(PAGE_SIZES[0]);
	const [sort, setSort] = useState<DataTableSort>({ key: 'id', direction: 'asc' });

	const { t } = useTranslation();
	const navigate = useNavigate();
	// The query key includes page/limit/sort, so changing state refetches on its own.
	const {
		data: response,
		isPending,
		isError
	} = useProjectsQuery(status, { page, limit }, getSortQuery(sort.key, sort.direction));

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
			header: t('routes.Dashboard.table.description'),
			render: project => {
				const stripped = strip(project.description);
				return stripped.length > 100 ? `${stripped.slice(0, 100)}...` : stripped;
			}
		}
	];

	return (
		<Box mt={15}>
			<Title order={4}>{title}</Title>
			<Box mt={15}>
				<DataTable
					columns={columns}
					rows={projects}
					rowKey={project => project.id}
					onRowClick={(project, e) => {
						const href = `/project/${project.id}`;
						if (e.ctrlKey || e.metaKey || ('button' in e && e.button === 1)) window.open(href, '_blank');
						else navigate(href);
					}}
					maxHeight="70vh"
					sort={sort}
					onSortChange={setSort}
					loading={isPending}
					error={isError ? { title: t('routes.Dashboard.error.connection') } : undefined}
					emptyTitle={t('routes.Dashboard.error.noActiveProjects')}
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
		</Box>
	);
};

export default ProjectTable;
