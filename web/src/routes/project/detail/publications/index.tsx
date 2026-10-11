import { ActionIcon, Box, Checkbox, Divider, Group, NumberInput, Stack, TextInput, Title } from '@mantine/core';
import { IconClipboardPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HTTPError } from 'ky';
import { Button, DataTable, type DataTableSort } from '@metacentrum/design-system';

import PageBreadcrumbs from '@/components/global/page-breadcrumbs';
import { useProjectOutletContext } from '@/modules/auth/guards/project-detail-guard';
import { type Publication } from '@/modules/publication/model';
import {
	manualPublicationSchema,
	type ManualPublicationSchema,
	searchByDoiSchema,
	type SearchByDoiSchema
} from '@/modules/publication/form';
import { searchByDoi } from '@/modules/publication/api/search-by-doi';
import PublicationCard from '@/components/project/publications/publication-card';
import { useAddPublicationsMutation } from '@/modules/publication/mutations';
import { useAssignMyPublicationMutation, useMyPublicationsQuery } from '@/modules/publication/my-queries';
import { PUBLICATION_PAGE_SIZES } from '@/modules/publication/constants';
import { getSortQuery } from '@/modules/api/sorting/utils';

const isHttpError = (value: unknown): value is HTTPError => value instanceof HTTPError;

const ProjectPublicationsAddPage = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { project } = useProjectOutletContext();

	const [publications, setPublications] = useState<Publication[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const searchDoiForm = useForm<SearchByDoiSchema>({
		resolver: zodResolver(searchByDoiSchema)
	});
	const addPublicationManuallyForm = useForm<ManualPublicationSchema>({
		resolver: zodResolver(manualPublicationSchema)
	});

	const { mutate, isPending } = useAddPublicationsMutation();
	const assignMutation = useAssignMyPublicationMutation();

	// state for "My publications" modal
	const [isMyModalOpen, setIsMyModalOpen] = useState(false);
	const [myPage, setMyPage] = useState(1);
	const [myLimit, setMyLimit] = useState(PUBLICATION_PAGE_SIZES[0]);
	const [mySort, setMySort] = useState<DataTableSort>({ key: 'id', direction: 'asc' });
	const mySortQuery = useMemo(
		() => getSortQuery(mySort.key, mySort.direction),
		[mySort]
	);
	const {
		data: myResponse,
		isPending: isMyLoading,
		refetch: refetchMy
	} = useMyPublicationsQuery({ page: myPage, limit: myLimit }, mySortQuery);
	const myRecords = myResponse?.data ?? [];
	const myTotal = myResponse?.metadata?.totalRecords ?? 0;
	const [selectedMy, setSelectedMy] = useState<Publication[]>([]);
	// DataTable has no row selection; use a checkbox column.
	const isMySelected = (publication: Publication) => selectedMy.some(selected => selected.id === publication.id);
	const toggleMySelected = (publication: Publication) =>
		setSelectedMy(selected =>
			selected.some(item => item.id === publication.id)
				? selected.filter(item => item.id !== publication.id)
				: [...selected, publication]
		);
	const allMySelected = myRecords.length > 0 && myRecords.every(isMySelected);
	const someMySelected = myRecords.some(isMySelected);
	const toggleAllMySelected = () =>
		setSelectedMy(selected =>
			allMySelected
				? selected.filter(item => !myRecords.some(record => record.id === item.id))
				: [...selected, ...myRecords.filter(record => !selected.some(item => item.id === record.id))]
		);

	const handleSelect = (pickedPublication: Publication) => {
		// publication is picked - remove
		if (publications.some((publication: Publication) => publication.uniqueId === pickedPublication.uniqueId)) {
			setPublications((publications: Publication[]) =>
				publications.filter((publication: Publication) => publication.uniqueId !== pickedPublication.uniqueId)
			);
		} else {
			setPublications((publications: Publication[]) => [...publications, pickedPublication]);
		}
	};

	const searchDoiSubmit = async (values: SearchByDoiSchema) => {
		setIsSearching(true);
		const publication = await searchByDoi(values.doi);
		setIsSearching(false);

		if (!publication) {
			searchDoiForm.setError('doi', {
				type: 'custom',
				message: 'Publication not found'
			});
			return;
		}

		searchDoiForm.reset();
		handleSelect({
			...publication,
			source: 'doi'
		});
	};

	const onManualAddSubmit = (values: ManualPublicationSchema) => {
		const publication: Publication = {
			title: values.title,
			year: +values.year,
			authors: values.authors,
			journal: values.journal,
			source: 'manual'
		};

		handleSelect(publication);
		addPublicationManuallyForm.reset();
		modals.closeAll();
	};

	const openManualPublicationAdd = () => {
		modals.open({
			title: t('routes.ProjectPublicationsAddPage.modal.title'),
			centered: true,
			size: 'xl',
			children: (
				<form onSubmit={addPublicationManuallyForm.handleSubmit(onManualAddSubmit)}>
					<TextInput
						label={t('routes.ProjectPublicationsAddPage.modal.form.title')}
						{...addPublicationManuallyForm.register('title')}
						error={addPublicationManuallyForm.formState.errors.title?.message}
						withAsterisk
						placeholder="Interaction effects in topological superconducting wires supporting Majorana fermions"
					/>
					<TextInput
						label={t('routes.ProjectPublicationsAddPage.modal.form.authors')}
						withAsterisk
						{...addPublicationManuallyForm.register('authors')}
						error={addPublicationManuallyForm.formState.errors.authors?.message}
						placeholder="E. M. Stoudenmire and Jason Alicea and Oleg A. Starykh and Matthew P.A. Fisher"
					/>
					<Controller
						control={addPublicationManuallyForm.control}
						name="year"
						render={({ field }) => (
							<NumberInput
								label={t('routes.ProjectPublicationsAddPage.modal.form.year')}
								placeholder="2011"
								name={field.name}
								withAsterisk
								min={0}
								max={2200}
								error={addPublicationManuallyForm.formState.errors.year?.message}
								onChange={e => field.onChange(+e)}
							/>
						)}
					/>
					<TextInput
						label={t('routes.ProjectPublicationsAddPage.modal.form.journal')}
						placeholder="Physical Review B"
						withAsterisk
						{...addPublicationManuallyForm.register('journal')}
						error={addPublicationManuallyForm.formState.errors.journal?.message}
					/>
					<Group mt={15} justify="center">
						<Button variant="primary" type="submit">{t('routes.ProjectPublicationsAddPage.modal.form.submit')}</Button>
					</Group>
				</form>
			)
		});
	};

	const openAddFromMy = async () => {
		setIsMyModalOpen(true);
		await refetchMy();
	};

	const closeAddFromMy = () => {
		setIsMyModalOpen(false);
		setSelectedMy([]);
	};

	const assignSelectedFromMy = async () => {
		if (!selectedMy.length) return;
		const assignable = selectedMy.filter((publication: Publication): publication is Publication & { id: number } =>
			typeof publication.id === 'number'
		);
		if (!assignable.length) return;
		try {
			await Promise.all(
				assignable.map((publication: Publication & { id: number }) =>
					assignMutation.mutateAsync({ id: publication.id, projectId: project.id })
				)
			);
			notifications.show({ message: t('routes.ProjectPublicationsAddPage.my.assign_success', { count: assignable.length }) });
			await refetchMy();
			await queryClient.invalidateQueries({ queryKey: ['project', project.id, 'publications'] });
			closeAddFromMy();
			navigate(`/project/${project.id}`);
		} catch (e) {
			if (isHttpError(e) && e.response.status === 404) {
				notifications.show({
					message: t('routes.ProjectPublicationsAddPage.no_access', {
						defaultValue: 'You do not have access to update publications in this project.'
					}),
					color: 'yellow'
				});
				return;
			}
			notifications.show({ message: t('routes.ProjectPublicationsAddPage.error.message'), color: 'red' });
		}
	};

	const addPublications = () => {
		mutate(
			{
				projectId: project.id,
				publications
			},
			{
				onSuccess: async () => {
					notifications.show({
						message: t('routes.ProjectPublicationsAddPage.success.message')
					});
					await queryClient.invalidateQueries({ queryKey: ['project', project.id, 'publications'] });
					navigate(`/project/${project.id}`);
				},
				onError: (error: unknown) => {
				if (isHttpError(error) && error.response.status === 404) {
					notifications.show({
						message: t('routes.ProjectPublicationsAddPage.no_access', {
							defaultValue: 'You do not have access to update publications in this project.'
						}),
						color: 'yellow'
					});
					return;
				}

				notifications.show({
					message: t('routes.ProjectPublicationsAddPage.error.message'),
					color: 'red'
				});
			}
			}
		);
	};

	return (
		<Box>
			<PageBreadcrumbs
				links={[
					{ title: 'Projects', href: '/project' },
					{ title: project.title, href: `/project/${project.id}` },
					{ title: t('routes.ProjectPublicationsAddPage.title'), href: `/project/${project.id}/publications` }
				]}
			/>
			<Title>{project.title}</Title>
			<Title order={3} mt={20}>
				{t('routes.ProjectPublicationsAddPage.title')}
			</Title>
			<Stack mt={20}>
				<form onSubmit={searchDoiForm.handleSubmit(searchDoiSubmit)}>
					<Stack>
						<TextInput
							label="DOI"
							placeholder="Search by DOI"
							error={searchDoiForm.formState.errors.doi?.message}
							{...searchDoiForm.register('doi')}
						/>
						<Button variant="primary" fullWidth type="submit" icon={<IconSearch />} loading={isSearching}>
							{t('routes.ProjectPublicationsAddPage.search_by_doi')}
						</Button>
					</Stack>
				</form>
				<Divider label="or" />
				<Button
					onClick={openManualPublicationAdd}
					variant="secondary"
					icon={<IconClipboardPlus />}
				>
					{t('routes.ProjectPublicationsAddPage.add_manually')}
				</Button>
				<Button onClick={openAddFromMy} variant="secondary">
					{t('routes.ProjectPublicationsAddPage.add_from_my_publications')}
				</Button>
			</Stack>
			{publications.length > 0 && (
				<Box py={30}>
					<Title order={4}>{t('routes.ProjectPublicationsAddPage.table.title')}</Title>
					<DataTable
						maxHeight="500px"
						rows={publications}
						rowKey={publication => publication.uniqueId ?? publication.id ?? publication.title}
						columns={[
							{
								key: 'title',
								header: t('components.project.publications.index.columns.publication_info'),
								render: (publication: Publication) => (
									<PublicationCard publication={publication} />
								)
							},
							{
								key: 'year',
								header: t('components.project.publications.index.columns.year'),
								width: '150px'
							},
							{
								key: 'actions',
								header: '',
								width: '120px',
								render: (userInfo: Publication) => (
									<Group gap={4} justify="space-between" wrap="nowrap">
										<ActionIcon
											size="sm"
											variant="subtle"
											color="red"
											onClick={() => handleSelect(userInfo)}
										>
											<IconTrash size={24} />
										</ActionIcon>
									</Group>
								)
							}
						]}
					/>
					<Button onClick={addPublications} variant="primary" fullWidth style={{ marginTop: 10 }} loading={isPending}>
						{publications.length === 1
							? t('routes.ProjectPublicationsAddPage.add_button_one', { count: 1, defaultValue: 'Add publication to project' })
							: t('routes.ProjectPublicationsAddPage.add_button_other', { count: publications.length, defaultValue: 'Add publications to project' })}
					</Button>
				</Box>
			)}

			{isMyModalOpen && (
				<Box py={30}>
					<Title order={4}>{t('routes.ProjectPublicationsAddPage.my.title', { defaultValue: 'My publications' })}</Title>
					<DataTable
						maxHeight="500px"
						loading={isMyLoading}
						rows={myRecords}
						rowKey={publication => publication.id ?? publication.uniqueId ?? publication.title}
						pagination={{
							page: myPage,
							pageSize: myLimit,
							totalItems: myTotal,
							pageSizes: PUBLICATION_PAGE_SIZES,
							onChange: ({ page, pageSize }) => {
								setMyPage(page);
								setMyLimit(pageSize);
							}
						}}
						sort={mySort}
						onSortChange={setMySort}
						columns={[
							{
								key: 'select',
								header: (
									<Checkbox
										aria-label="Select all"
										checked={allMySelected}
										indeterminate={someMySelected && !allMySelected}
										onChange={toggleAllMySelected}
									/>
								),
								width: '48px',
								render: publication => (
									<Checkbox
										aria-label={publication.title}
										checked={isMySelected(publication)}
										onChange={() => toggleMySelected(publication)}
									/>
								)
							},
							{ key: 'title', header: t('components.project.publications.index.columns.publication_info') },
							{ key: 'year', header: t('components.project.publications.index.columns.year'), width: '150px' }
						]}
					/>
					<Group mt={10} justify="flex-end">
						<Button variant="secondary" onClick={closeAddFromMy}>{t('common.cancel', { defaultValue: 'Cancel' })}</Button>
						<Button variant="primary" onClick={assignSelectedFromMy} loading={assignMutation.isPending}>
							{t('routes.ProjectPublicationsAddPage.my.assign_selected', { defaultValue: 'Assign selected' })}
						</Button>
					</Group>
				</Box>
			)}
		</Box>
	);
};

export default ProjectPublicationsAddPage;
