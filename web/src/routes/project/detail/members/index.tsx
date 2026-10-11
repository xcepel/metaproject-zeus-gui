import { ActionIcon, Box, Button, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DataTable } from '@metacentrum/design-system';

import { useAddProjectMemberMutation } from '@/modules/project/mutations';
import { addMembersSchema, addSingleMemberSchema, type AddSingleMemberSchema } from '@/modules/project/form';
import PageBreadcrumbs from '@/components/global/page-breadcrumbs';
import { useProjectOutletContext } from '@/modules/auth/guards/project-detail-guard';

type PickedUser = {
	email: string;
	role?: string;
};

const ProjectDetailMembers = () => {
	const { project, permissions } = useProjectOutletContext();
	const navigate = useNavigate();
	const { mutate, isPending } = useAddProjectMemberMutation();
	const [pickedMembers, setPickedMembers] = useState<PickedUser[]>([]);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset
	} = useForm<AddSingleMemberSchema>({
		resolver: zodResolver(addSingleMemberSchema)
	});

	const onClick = () => {
		const members = pickedMembers.map(member => ({
			email: member.email,
			role: member.role ?? 'user'
		}));

		const body = addMembersSchema.parse({
			projectId: project.id,
			members
		});

		mutate(body, {
			onSuccess: () => {
				notifications.show({ title: 'Members added', message: 'Members added to project', color: 'teal' });
				navigate(`/project/${project.id}`);
			},
			onError: () => {
				notifications.show({
					title: 'Members not added.',
					message: 'Could not add members. Try again later.',
					color: 'red'
				});
			}
		});
	};

	const addUser = (data: AddSingleMemberSchema) => {
		setPickedMembers([...pickedMembers, { email: data.email }]);
		reset();
	};

	const removeUser = (email: string) => {
		setPickedMembers(pickedMembers => pickedMembers.filter(m => m.email !== email));
	};

	const changeUserRole = (email: string, role: string | null) => {
		setPickedMembers(pickedMembers =>
			pickedMembers.map(m => {
				if (m.email !== email) {
					return m;
				}

				m.role = role ?? undefined;
				return m;
			})
		);
	};

	const getUserRole = (email: string) => pickedMembers.find(m => m.email === email)?.role ?? 'user';

	return (
		<Box>
			<PageBreadcrumbs
				links={[
					{ title: 'Projects', href: '/project' },
					{ title: project.title, href: `/project/${project.id}` },
					{ title: 'Add members', href: `/project/${project.id}/members` }
				]}
			/>
			<Title>{project.title}</Title>
			<Title order={3} mt={20}>
				Add members
				<form onSubmit={handleSubmit(addUser)}>
					<Stack align="center">
						<TextInput
							w="100%"
							label="User email"
							placeholder="1234@mail.muni.cz"
							{...register('email')}
							error={errors.email?.message}
						/>
						<Button type="submit" fullWidth>
							Submit
						</Button>
					</Stack>
				</form>
			</Title>
			{pickedMembers.length > 0 && (
				<Box mt={30}>
					<Title order={4}>Picked members</Title>
					<DataTable
						maxHeight="500px"
						rows={pickedMembers}
						rowKey={member => member.email}
						columns={[
							{
								key: 'email',
								header: 'E-mail',
								render: userInfo => userInfo.email
							},
							{
								key: 'role',
								header: 'Role',
								width: '200px',
								render: userInfo => {
									if (permissions.includes('edit_managers')) {
										return (
											<Select
												allowDeselect={false}
												value={getUserRole(userInfo.email)}
												onChange={value => {
													changeUserRole(userInfo.email, value);
												}}
												data={[
													{ value: 'user', label: 'User' },
													{ value: 'manager', label: 'Manager' }
												]}
											/>
										);
									}

									return 'User';
								}
							},
							{
								key: 'actions',
								header: '',
								width: '120px',
								render: userInfo => (
									<Group gap={4} justify="space-between" wrap="nowrap">
										<ActionIcon
											size="sm"
											variant="subtle"
											color="red"
											onClick={() => removeUser(userInfo.email)}
										>
											<IconTrash size={24} />
										</ActionIcon>
									</Group>
								)
							}
						]}
					/>
					<Button color="teal" fullWidth mt={10} onClick={onClick} loading={isPending}>
						Add {pickedMembers.length} member{pickedMembers.length > 1 ? 's' : ''}
					</Button>
					<Group justify="center" my={10}>
						<Text c="gray">
							Disclaimer: E-mail addresses that are already part of the project will be ignored.
						</Text>
					</Group>
				</Box>
			)}
		</Box>
	);
};

export default ProjectDetailMembers;
