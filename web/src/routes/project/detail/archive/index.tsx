import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Group, Input, rem, Stack, Text, Textarea, Title } from '@mantine/core';
import { IconFileText, IconInfoCircle, IconUpload, IconX } from '@tabler/icons-react';
import { Dropzone, type FileWithPath, MS_WORD_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Button } from '@metacentrum/design-system';

import { type ArchiveProjectSchema, archiveProjectSchema } from '@/modules/project/form';
import { useArchiveProjectMutation } from '@/modules/project/mutations';
import PageBreadcrumbs from '@/components/global/page-breadcrumbs';
import { getIcon } from '@/modules/file/icon';
import { useProjectOutletContext } from '@/modules/auth/guards/project-detail-guard';

const ProjectArchivePage = () => {
	const { project, permissions } = useProjectOutletContext();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { mutate, isPending } = useArchiveProjectMutation();
	const [file, setFile] = useState<FileWithPath | null>(null);
	const {
		control,
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<ArchiveProjectSchema>({
		resolver: zodResolver(archiveProjectSchema)
	});

	useEffect(() => {
		if (!permissions.includes('edit_project')) {
			navigate(`/project/${project.id}`);
		}
	}, [permissions]);

	const onSubmit = (values: ArchiveProjectSchema) => {
		mutate(
			{ justification: values.justification, projectId: project.id, file },
			{
				onSuccess: () => {
					queryClient
						.refetchQueries({
							queryKey: ['project', project.id]
						})
						.then(() => {
							navigate(`/project/${project.id}`);
							notifications.show({
								title: 'Project archived',
								message: 'Project has been successfully archived.'
							});
						});
				},
				onError: () => {
					notifications.show({
						title: 'Failed to archive project',
						message: 'Please try again later.',
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
					{ title: 'Archive project', href: `/project/${project.id}/archive` }
				]}
			/>
			<Title>Project archival</Title>
			<Title order={3} pb={30} pt={15}>
				Title: {project.title}
			</Title>
			<Alert variant="light" color="yellow" title="Warning" icon={<IconInfoCircle />}>
				Archiving project will make it inactive and you will not be able to edit it anymore. All resources will
				be deallocated.
			</Alert>
			<Text mt={20}>
				You can archive this project if goal of this project has been achieved. Archived projects are not
				deleted, but they can not be edited anymore and are only viewable for historical purposes. For
				successful project archival, you need to write justification and you can optionally add your final
				report.
			</Text>

			<Box mt={20}>
				<form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
					<Textarea
						label="Justification"
						withAsterisk
						description="Add reasons for archiving this project "
						placeholder="Project has ended."
						autosize
						minRows={6}
						error={errors.justification?.message}
						{...register('justification')}
					/>
					<Controller
						control={control}
						name="file"
						render={({ field }) => (
							<Input.Wrapper
								label="Final report"
								withAsterisk
								description="You can load only one final report"
								error={errors.file?.message}
								mt={15}
							>
								<Dropzone
									multiple={false}
									onDrop={files => setFile(files[0])}
									maxSize={5 * 1024 ** 2}
									accept={[...PDF_MIME_TYPE, ...MS_WORD_MIME_TYPE]}
									{...field}
								>
									<Group justify="center" gap="xl" mih={150} style={{ pointerEvents: 'none' }}>
										<Dropzone.Accept>
											<IconUpload
												style={{
													width: rem(52),
													height: rem(52),
													color: 'var(--mantine-color-blue-6)'
												}}
												stroke={1.5}
											/>
										</Dropzone.Accept>
										<Dropzone.Reject>
											<IconX
												style={{
													width: rem(52),
													height: rem(52),
													color: 'var(--mantine-color-red-6)'
												}}
												stroke={1.5}
											/>
										</Dropzone.Reject>
										<Dropzone.Idle>
											{!file && (
												<IconFileText
													style={{
														width: rem(52),
														height: rem(52),
														color: 'var(--mantine-color-dimmed)'
													}}
													stroke={1.5}
												/>
											)}
										</Dropzone.Idle>

										{!file && (
											<Box>
												<Text size="xl" inline>
													Drag your report here or click to select file
												</Text>
												<Text size="sm" c="dimmed" inline mt={7}>
													Attach only one PDF or Word document
												</Text>
											</Box>
										)}
										{file && (
											<Group>
												{getIcon(file.type, 64)}
												<Stack gap={1}>
													<Text size="xl" inline>
														{file.path}
													</Text>
													<Text c="dimmed" size="xs">
														Click anywhere to replace this file with another.
													</Text>
												</Stack>
											</Group>
										)}
									</Group>
								</Dropzone>
							</Input.Wrapper>
						)}
					/>
					<Group justify="center" mt={10}>
						<Button variant="primary" type="submit" loading={isPending}>
							Submit
						</Button>
					</Group>
				</form>
			</Box>
		</Box>
	);
};

export default ProjectArchivePage;
