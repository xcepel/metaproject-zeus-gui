import { Badge, Box, Group, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { IconBan, IconCheck, IconClock, IconClockX, IconCpu, IconNews, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button, DataTable, type DataTableSort } from '@metacentrum/design-system';

import RouterLink from '@/components/global/router-link';
import { PAGE_SIZES } from '@/modules/api/pagination/constants';
import { getSortQuery } from '@/modules/api/sorting/utils';
import Loading from '@/components/global/loading';
import ErrorAlert from '@/components/global/error-alert';
import { useProjectAllocationsQuery } from '@/modules/allocation/api/allocations';

type ProjectAllocationTableProps = {
	id: number;
};

const ProjectAllocationsTable = ({ id }: ProjectAllocationTableProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(PAGE_SIZES[0]);
	const [sort, setSort] = useState<DataTableSort>({ key: 'id', direction: 'asc' });

	const {
		data: allocations,
		isPending,
		isError
	} = useProjectAllocationsQuery(
		id,
		{
			page,
			limit
		},
		getSortQuery(sort.key, sort.direction)
	);

	if (isPending) {
		return <Loading />;
	}

	if (isError) {
		return <ErrorAlert />;
	}

	const metadata = allocations.metadata;
	const allocationsData = allocations.data ?? [];

	if (!metadata) {
		return null;
	}

	return (
		<Box mt={30}>
			<Group justify="space-between" mb={5}>
				<Group>
					<Title order={3}>
						<IconCpu /> {t('components.project.allocations.index.title')}
					</Title>
					<Badge variant="filled" color="gray">
						{metadata.totalRecords}
					</Badge>
				</Group>
				<Button
					href={`/project/${id}/allocation`}
					linkAs={RouterLink}
					variant="primary"
					icon={<IconPlus size={14} />}
				>
					{t('components.project.allocations.index.request_allocation')}
				</Button>
			</Group>
			<DataTable
				maxHeight="300px"
				rows={allocationsData}
				rowKey={allocation => allocation.id}
				onRowClick={(allocation, e) => {
					const href = `/project/${id}/allocation/${allocation.id}`;
					if (e.ctrlKey || e.metaKey || ('button' in e && e.button === 1)) window.open(href, '_blank');
					else navigate(href);
				}}
				emptyTitle={t('components.project.allocations.index.no_records_text')}
				sort={sort}
				onSortChange={setSort}
				pagination={{
					page: metadata.page,
					pageSize: metadata.recordsPerPage,
					totalItems: metadata.totalRecords,
					pageSizes: PAGE_SIZES,
					onChange: ({ page: nextPage, pageSize }) => {
						setPage(nextPage);
						setLimit(pageSize);
					}
				}}
				columns={[
					{
						key: 'name',
						header: t('components.project.allocations.index.columns.resource_name'),
						width: '200px',
						render: allocation => allocation.resource.name,
						sortable: true
					},
					{
						key: 'type',
						header: t('components.project.allocations.index.columns.resource_type'),
						width: '200px',
						render: allocation => allocation.resource.type,
						sortable: true
					},
					{
						key: 'user',
						header: t('components.project.allocations.index.columns.user'),
						render: allocation => (
							<Stack>
								{allocation.allocationUsers.map(user => (
									<Text key={user.id} size="sm">
										{user.name} ({user.email})
									</Text>
								))}
							</Stack>
						)
					},
					{
						key: 'status',
						header: t('components.project.allocations.index.columns.status'),
						width: '150px',
						sortable: true,
						render: allocation => {
							if (allocation.status === 'active') {
								return (
									<Group gap={4} c="green">
										<IconCheck size={14} />
										<Text size="sm">Active</Text>
									</Group>
								);
							}
							if (allocation.status === 'pending') {
								return (
									<Group gap={4} c="orange">
										<IconClock size={14} />
										<Text size="sm">Pending</Text>
									</Group>
								);
							}
							if (allocation.status === 'new') {
								return (
									<Group gap={4} c="blue.9">
										<IconNews size={14} />
										<Text size="sm">New</Text>
									</Group>
								);
							}
							if (allocation.status === 'denied') {
								return (
									<Group gap={4} c="red.9">
										<IconBan size={14} />
										<Text size="sm">Denied</Text>
									</Group>
								);
							}
							if (allocation.status === 'revoked') {
								return (
									<Group gap={4} c="red.9">
										<IconBan size={14} />
										<Text size="sm">Revoked</Text>
									</Group>
								);
							}
							if (allocation.status === 'expired') {
								return (
									<Group gap={4} c="orange.6">
										<IconClockX size={14} />
										<Text size="sm">Expired</Text>
									</Group>
								);
							}

							return <Text size="sm">{allocation.status}</Text>;
						}
					},
					{
						key: 'endDate',
						header: t('components.project.allocations.index.columns.end_date'),
						render: allocation =>
							allocation.endDate ? dayjs(allocation.endDate).format('DD.MM.YYYY') : 'None',
						width: '150px',
						sortable: true
					}
				]}
			/>
		</Box>
	);
};

export default ProjectAllocationsTable;
