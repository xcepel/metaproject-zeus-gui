import { ActionIcon, Badge, Box, Group, Text, Title } from '@mantine/core';
import { IconCheck, IconClock, IconForbid, IconTrash, IconUser, IconUsers, IconUserUp } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { DataTable, type DataTableSort } from '@metacentrum/design-system';

import { useProjectMembersQuery } from '@/modules/project/queries';
import ErrorAlert from '@/components/global/error-alert';
import AddButton from '@/components/project/members/add-button';
import { useRemoveProjectMemberMutation } from '@/modules/project/mutations';
import { PAGE_SIZES } from '@/modules/api/pagination/constants';
import { type ProjectMember } from '@/modules/project/model';
import { getSortQuery } from '@/modules/api/sorting/utils';
import { useProjectOutletContext } from '@/modules/auth/guards/project-detail-guard';
import Loading from '@/components/global/loading';

type ProjectMembersProps = {
	id: number;
};

const ProjectMembers = ({ id }: ProjectMembersProps) => {
	const { t } = useTranslation();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(PAGE_SIZES[0]);
	const [currentMember, setCurrentMember] = useState<number | null>(null);
	const [sort, setSort] = useState<DataTableSort>({ key: 'id', direction: 'asc' });

	const { permissions } = useProjectOutletContext();
	const { mutate, isPending: isRemovePending } = useRemoveProjectMemberMutation();
	const {
		data: response,
		isPending,
		isError,
		refetch
	} = useProjectMembersQuery(
		id,
		{
			page,
			limit
		},
		getSortQuery(sort.key, sort.direction)
	);

	if (isPending || !response) {
		return <Loading />;
	}

	if (isError) {
		return <ErrorAlert />;
	}

	const metadata = response.metadata ?? { totalRecords: 0, currentPage: 1 };
	const members = response.data ?? [];

	const removeUser = (memberId: number) => {
		setCurrentMember(memberId);
		mutate(
			{ projectId: id, memberId },
			{
				onSuccess: () => {
					refetch().then(() => {
						notifications.show({
							title: 'Success',
							message: 'Member removed successfully',
							color: 'blue'
						});
					});
				},
				onSettled: () => {
					setCurrentMember(null);
				}
			}
		);
	};

	return (
		<Box mt={30}>
			<Group justify="space-between" mb={5}>
				<Group>
					<Title order={3}>
						<IconUsers /> {t('components.project.members.index.title')}
					</Title>
					{metadata && (
						<Badge variant="filled" color="gray">
							{metadata.totalRecords}
						</Badge>
					)}
				</Group>
				{permissions.includes('edit_members') && <AddButton id={id} />}
			</Group>
			<DataTable
				maxHeight="300px"
				rows={members}
				rowKey={member => member.id}
				emptyTitle={t('components.project.members.index.no_records_text')}
				sort={sort}
				onSortChange={setSort}
				pagination={{
					page,
					pageSize: limit,
					totalItems: metadata?.totalRecords ?? 0,
					pageSizes: PAGE_SIZES,
					onChange: ({ page: nextPage, pageSize }) => {
						setPage(nextPage);
						setLimit(pageSize);
					}
				}}
				columns={[
					{
						key: 'id',
						header: t('components.project.members.index.columns.id'),
						width: '150px',
						sortable: true
					},
					{
						key: 'name',
						header: t('components.project.members.index.columns.name'),
						render: member => member.userInfo.name,
						sortable: true
					},
					{
						key: 'email',
						header: t('components.project.members.index.columns.email'),
						render: member => member.userInfo.email,
						sortable: true
					},
					{
						key: 'role',
						header: t('components.project.members.index.columns.role.title'),
						render: member => {
							if (member.role === 'manager') {
								return (
									<Group gap={4}>
										<IconUserUp size={16} />
										<Text>{t('components.project.members.index.columns.role.manager')}</Text>
									</Group>
								);
							}
							return (
								<Group gap={4}>
									<IconUser size={16} />
									<Text>{t('components.project.members.index.columns.role.user')}</Text>
								</Group>
							);
						}
					},
					{
						key: 'status',
						header: t('components.project.members.index.columns.status'),
						sortable: true,
						render: member => {
							if (member.status === 'active') {
								return (
									<Group gap={4} c="green">
										<IconCheck size={14} />
										<Text size="sm">Active</Text>
									</Group>
								);
							}
							if (member.status === 'pending') {
								return (
									<Group gap={4} c="orange">
										<IconClock size={14} />
										<Text size="sm">Pending</Text>
									</Group>
								);
							}
							return (
								<Group gap={4} c="red">
									<IconForbid size={14} />
									<Text size="sm">Inactive</Text>
								</Group>
							);
						}
					},
					...(permissions.includes('edit_members')
						? [
								{
									key: 'actions',
									header: t('components.project.members.index.columns.actions'),
									width: '120px',
									render: (member: ProjectMember) => (
										<Group gap={4} justify="space-between" wrap="nowrap">
											<ActionIcon
												size="sm"
												variant="subtle"
												color="red"
												disabled={member.status === 'removed'}
												loading={isRemovePending && currentMember === member.id}
												onClick={() => removeUser(member.id)}
											>
												<IconTrash size={24} />
											</ActionIcon>
										</Group>
									)
								}
							]
						: [])
				]}
			/>
		</Box>
	);
};

export default ProjectMembers;
