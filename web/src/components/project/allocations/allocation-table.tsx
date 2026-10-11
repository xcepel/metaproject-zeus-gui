import { ActionIcon, Anchor, Badge, Box, Group, Text, Tooltip } from '@mantine/core';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type UseQueryResult } from '@tanstack/react-query';
import { IconBan, IconCheck, IconClock, IconClockX, IconFolder, IconNews, IconEdit } from '@tabler/icons-react';
import { DataTable, type DataTableSort } from '@metacentrum/design-system';

import { PAGE_SIZES } from '@/modules/api/pagination/constants';
import { type PaginationResponse } from '@/modules/api/pagination/model';
import { type AllocationAdmin } from '@/modules/allocation/model';

type AllocationAdminTableProps = {
	useAllocationQuery: (
		page: number,
		limit: number,
		sort: DataTableSort
	) => UseQueryResult<PaginationResponse<AllocationAdmin>, Error>;
	buildLink: (allocation: AllocationAdmin) => string;
};

const AllocationAdminTable = ({ useAllocationQuery, buildLink }: AllocationAdminTableProps) => {
	const { t } = useTranslation();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(PAGE_SIZES[0]);
	const [sort, setSort] = useState<DataTableSort>({ key: 'id', direction: 'asc' });

	// The query key includes page/limit/sort, so changing state refetches on its own.
	const { data: response, isPending, isError } = useAllocationQuery(page, limit, sort);

	const metadata = response?.metadata ?? { totalRecords: 0, currentPage: 1 };
	const allocations = response?.data ?? [];

	return (
		<Box mt={15}>
			<DataTable
				rows={allocations}
				rowKey={allocation => allocation.id}
				sort={sort}
				onSortChange={setSort}
				loading={isPending}
				error={isError ? { title: t('routes.Dashboard.error.connection') } : undefined}
				emptyTitle={t('components.allocationTable.noAllocations')}
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
				columns={[
					{
						key: 'id',
						header: t('components.allocationTable.columns.id'),
						width: '70px',
						sortable: true
					},
					{
						key: 'project',
						header: t('components.allocationTable.columns.project'),
						sortable: true,
						render: allocation => (
							<Anchor component={Link} to={`/project/${allocation.project.id}`}>
								{allocation.project.title}
							</Anchor>
						)
					},
					{
						key: 'pi',
						header: t('components.allocationTable.columns.pi'),
						sortable: true,
						render: allocation => allocation.project.pi.name
					},
					{
						key: 'resource',
						header: t('components.allocationTable.columns.resource'),
						sortable: true,
						render: allocation => (
							<Text>
								{allocation.resource.name} ({allocation.resource.type})
							</Text>
						)
					},
					{
						key: 'status',
						header: t('components.allocationTable.columns.status'),
						sortable: true,
						render: allocation => {
							const statusElement = (() => {
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
										<Group gap={4} c="orange.9">
											<IconClockX size={14} />
											<Text size="sm">Expired</Text>
										</Group>
									);
								}

								return <Text size="sm">{allocation.status}</Text>;
							})();

							return (
								<Group gap="xs">
									{statusElement}
									{allocation.hasPendingModification && (
										<Tooltip label="Has pending OpenStack modification request">
											<Badge
												size="xs"
												color="yellow"
												variant="light"
												leftSection={<IconEdit size={10} />}
											>
												Mod
											</Badge>
										</Tooltip>
									)}
								</Group>
							);
						}
					},
					{
						key: 'endDate',
						header: t('components.allocationTable.columns.endDate'),
						sortable: true,
						render: allocation =>
							allocation.endDate ? dayjs(allocation.endDate).format('DD.MM.YYYY') : 'None'
					},
					{
						key: 'actions',
						header: t('components.allocationTable.columns.actions'),
						render: allocation => (
							<ActionIcon variant="subtle" component={Link} to={buildLink(allocation)}>
								<IconFolder />
							</ActionIcon>
						)
					}
				]}
			/>
		</Box>
	);
};

export default AllocationAdminTable;
