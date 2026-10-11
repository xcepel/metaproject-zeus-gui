import { ActionIcon, Alert, Badge, Box, Group, Title, Tooltip } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconLibrary, IconTrash, IconTrashX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { HTTPError } from 'ky';
import { DataTable, type DataTableColumn, type DataTableSort } from '@metacentrum/design-system';

import AddPublication from '@/components/project/publications/add-publication';
import ErrorAlert from '@/components/global/error-alert';
import Loading from '@/components/global/loading';
import PublicationCard from '@/components/project/publications/publication-card';
import { useProjectOutletContext } from '@/modules/auth/guards/project-detail-guard';
import { getSortQuery } from '@/modules/api/sorting/utils';
import { PUBLICATION_PAGE_SIZES } from '@/modules/publication/constants';
import { useRemovePublicationMutation } from '@/modules/publication/mutations';
import { useDeleteMyPublicationMutation } from '@/modules/publication/my-queries';
import { type Publication } from '@/modules/publication/model';
import { useProjectPublicationsQuery } from '@/modules/publication/queries';

type ProjectPublicationsProps = {
	id: number;
};

const ProjectPublications = ({ id }: ProjectPublicationsProps) => {
	const { t } = useTranslation();
	const { permissions } = useProjectOutletContext();
	const [currentPublication, setCurrentPublication] = useState<number | null>(null);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(PUBLICATION_PAGE_SIZES[0]);
	const [sort, setSort] = useState<DataTableSort>({ key: 'id', direction: 'asc' });

	const { mutate, isPending: isRemovePending } = useRemovePublicationMutation();
	const deleteMyMutation = useDeleteMyPublicationMutation();
	const isHttpError = (value: unknown): value is HTTPError => value instanceof HTTPError;

	const {
		data: response,
		isPending,
		isError,
		error,
		refetch
	} = useProjectPublicationsQuery(id, { page, limit }, getSortQuery(sort.key, sort.direction));

	if (isPending) {
		return <Loading />;
	}

	if (isError) {
		if (isHttpError(error) && error.response?.status === 404) {
			return (
				<Alert color="yellow" variant="light">
					{t('components.project.publications.index.no_access_alert', {
						defaultValue: 'You do not have access to view publications for this project.'
					})}
				</Alert>
			);
		}

		return <ErrorAlert />;
	}

	const metadata = response?.metadata;
	const publications = response?.data ?? [];

	const removePublication = (publicationId?: number) => {
		if (publicationId === undefined) {
			return;
		}

		setCurrentPublication(publicationId);

		mutate(
			{ projectId: id, publicationId },
			{
				onSuccess: () => {
					notifications.show({
						message: t('components.project.publications.index.notifications.publication_removed')
					});
					void refetch();
				},
				onError: (mutationError: unknown) => {
					if (isHttpError(mutationError) && mutationError.response?.status === 404) {
						notifications.show({
							message: t('components.project.publications.index.notifications.no_access', {
								defaultValue: 'You do not have access to update publications in this project.'
							}),
							color: 'yellow'
						});
						return;
					}

					notifications.show({
						message: t('components.project.publications.index.notifications.error'),
						color: 'red'
					});
				},
				onSettled: () => {
					setCurrentPublication(null);
				}
			}
		);
	};

	const removeAndDelete = (publicationId?: number) => {
		if (!publicationId) {
			return;
		}

		modals.openConfirmModal({
			title: t('components.project.publications.index.delete_confirm_title', { defaultValue: 'Delete publication?' }),
			children: t('components.project.publications.index.delete_confirm_text', {
				defaultValue: 'This will remove it from the project and delete it from My publications.'
			}),
			labels: {
				confirm: t('common.delete', { defaultValue: 'Delete' }),
				cancel: t('common.cancel', { defaultValue: 'Cancel' })
			},
			confirmProps: { color: 'red' },
			onConfirm: () => {
				deleteMyMutation.mutate(publicationId, {
					onSuccess: () => {
						notifications.show({
							message: t(
								'components.project.publications.index.notifications.publication_deleted',
								{ defaultValue: 'Publication deleted' }
							)
						});
						void refetch();
					},
					onError: () => {
						notifications.show({
							message: t('components.project.publications.index.notifications.error'),
							color: 'red'
						});
					}
				});
			}
		});
	};

	const columns: DataTableColumn<Publication>[] = [
		{
			key: 'info',
			header: t('components.project.publications.index.columns.publication_info'),
			render: publication => <PublicationCard publication={publication} />
		},
		{
			key: 'year',
			header: t('components.project.publications.index.columns.year'),
			width: '150px',
			sortable: true
		}
	];

	if (permissions.includes('edit_publications')) {
		columns.push({
			key: 'actions',
			header: t('components.project.publications.index.columns.actions'),
			width: '160px',
			render: (publication: Publication) => (
				<Group gap={4} justify="space-between" wrap="nowrap">
					<Tooltip
						label={t('components.project.publications.index.tooltips.remove', {
							defaultValue: 'Remove from project'
						})}
						withArrow
					>
						<ActionIcon
							size="sm"
							variant="subtle"
							color="red"
							loading={isRemovePending && currentPublication === publication.id}
							onClick={() => removePublication(publication?.id)}
						>
							<IconTrash size={24} />
						</ActionIcon>
					</Tooltip>
					{publication.isOwner && (
						<Tooltip
							label={t('components.project.publications.index.tooltips.remove_and_delete', {
								defaultValue: 'Remove and delete from My publications'
							})}
							withArrow
						>
							<ActionIcon
								size="sm"
								variant="subtle"
								color="red"
								onClick={() => removeAndDelete(publication?.id)}
							>
								<IconTrashX size={24} />
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
			)
		});
	}

	return (
		<Box mt={30}>
			<Group justify="space-between" mb={5}>
				<Group>
					<Title order={3}>
						<IconLibrary /> {t('components.project.publications.index.title')}
					</Title>
					<Badge variant="filled" color="gray">
						{metadata?.totalRecords ?? 0}
					</Badge>
				</Group>
				{permissions.includes('edit_publications') && <AddPublication id={id} />}
			</Group>
			<DataTable
				maxHeight="300px"
				rows={publications}
				rowKey={publication => publication.id ?? publication.uniqueId ?? publication.title}
				emptyTitle={t('components.project.publications.index.no_records_text')}
				sort={sort}
				onSortChange={setSort}
				pagination={{
					page,
					pageSize: limit,
					totalItems: metadata?.totalRecords ?? 0,
					pageSizes: PUBLICATION_PAGE_SIZES,
					onChange: ({ page: nextPage, pageSize }) => {
						setPage(nextPage);
						setLimit(pageSize);
					}
				}}
				columns={columns}
			/>
		</Box>
	);
};

export default ProjectPublications;
