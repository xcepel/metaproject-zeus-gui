import {
	ActionIcon,
	Alert,
	Badge,
	Box,
	Group,
	Loader,
	rem,
	Select,
	SimpleGrid,
	Stack,
	Text,
	Title,
	Tooltip
} from '@mantine/core';
import { IconArchive, IconBan, IconInfoCircle, IconRepeat } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button, PageHeader, Tabs } from '@metacentrum/design-system';

import ProjectMembers from '@/components/project/members';
import RouterLink from '@/components/global/router-link';
import { ProjectStatus } from '@/modules/project/constants';
import FileView from '@/components/project/file';
import { useProjectOutletContext } from '@/modules/auth/guards/project-detail-guard';
import ProjectInfo from '@/components/project/info';
import ProjectPublications from '@/components/project/publications';
import CommentsTimeline from '@/components/project/comments-timeline';
import ProjectAllocationsTable from '@/components/project/allocations';
import UsageChartCard from '@/components/resource-usage/usage-chart-card';
import StaticMetricsCard from '@/components/resource-usage/static-metrics-card';
import { useResourceUsageSummary } from '@/modules/resource-usage/hooks/useResourceUsageSummary';
import type { ResourceUsageAllocationOption } from '@/modules/resource-usage/types';

const ProjectDetail = () => {
	const { project, permissions, archivalInfo, rejectedComments } = useProjectOutletContext();
	const { t } = useTranslation();
	const [selectedSource, setSelectedSource] = useState<string | null>(null);
	const [selectedAllocation, setSelectedAllocation] = useState<string | null>('all');
	const [initialSources, setInitialSources] = useState<string[]>([]);

	const { data: usageData, isLoading: isLoadingUsage } = useResourceUsageSummary({
		scopeType: 'project',
		scopeId: project.id.toString(),
		source: selectedSource || undefined,
		allocationId: selectedAllocation !== 'all' ? selectedAllocation || undefined : undefined
	});

	// Store initial sources to keep dropdown visible
	useEffect(() => {
		if (usageData?.availableSources && initialSources.length === 0) {
			setInitialSources(usageData.availableSources);
		}
	}, [usageData?.availableSources, initialSources.length]);

	// Determine if we're showing only OpenStack data (walltime is not relevant for OpenStack)
	const isOpenstackOnly =
		selectedSource === 'openstack' ||
		(usageData?.availableSources?.length === 1 && usageData?.availableSources[0] === 'openstack');

	const iconStyle = { width: rem(16), height: rem(16) };

	const showArchivalInfoTab =
		project.status === ProjectStatus.ARCHIVED && permissions.includes('view_advanced_details') && !!archivalInfo;
	const showRejectedInfoTab =
		project.status === ProjectStatus.REJECTED &&
		permissions.includes('view_advanced_details') &&
		!!rejectedComments;

	const [activeTab, setActiveTab] = useState<string>(
		showArchivalInfoTab ? 'archivalInfo' : showRejectedInfoTab ? 'rejectedComments' : 'projectInfo'
	);

	return (
		<Box>
			<PageHeader
				title={project.title}
				breadcrumbs={[{ label: 'Projects', href: '/project' }, { label: project.title }]}
				linkAs={RouterLink}
				actions={
					permissions.includes('edit_project') &&
					project.status === 'active' && (
						<Tooltip label="Archive project" position="bottom">
							<ActionIcon
								component={Link}
								variant="transparent"
								color="gray"
								size="lg"
								radius="md"
								aria-label="Settings"
								to="archive"
							>
								<IconArchive style={{ width: rem(24), height: rem(24) }} stroke={1.5} />
							</ActionIcon>
						</Tooltip>
					)
				}
			>
				<Badge
					variant="light"
					size="lg"
					color={
						project.status === ProjectStatus.ACTIVE
							? 'teal'
							: project.status === ProjectStatus.NEW
								? 'orange'
								: 'red'
					}
				>
					{t(`routes.ProjectDetail.status.${project.status}`)}
				</Badge>
			</PageHeader>
			{project.status === ProjectStatus.NEW && (
				<Alert mt={5} variant="light" color="yellow" title="Project is not active" icon={<IconInfoCircle />}>
					Current project, which you are editing is not yet accepted. You can only request allocations,
					changes to publications and members will be possible only when project is active.
				</Alert>
			)}
			{project.status === ProjectStatus.ARCHIVED && (
				<Alert mt={5} variant="light" color="red" title="Project is archived" icon={<IconInfoCircle />}>
					Current project is already archived.
				</Alert>
			)}
			{project.status === ProjectStatus.REJECTED && (
				<Alert mt={5} variant="light" color="red" title="Project is rejected" icon={<IconInfoCircle />}>
					Current project was already rejected. You can view comments from the reviewer and edit project
					accordingly.
				</Alert>
			)}
			<ProjectInfo project={project} showFullDescription={false} />

			<Box py={20}>
				<Tabs
					aria-label="Project detail"
					selected={activeTab}
					onChange={setActiveTab}
					tabs={[
						...(showArchivalInfoTab
							? [
									{
										id: 'archivalInfo',
										label: 'Archival info',
										icon: <IconArchive style={iconStyle} />,
										content: (
											<>
												<Stack mt={20}>
													<Box>
														<Title order={4}>Archival description:</Title>
														<Text>{archivalInfo.description}</Text>
													</Box>

													{archivalInfo.file && (
														<Box mb={40} mt={15}>
															<Title order={4}>Attached file:</Title>
															<FileView
																downloadType="archival"
																file={archivalInfo.file}
															/>
														</Box>
													)}
												</Stack>
											</>
										)
									}
								]
							: []),
						...(showRejectedInfoTab
							? [
									{
										id: 'rejectedComments',
										label: 'Reasons for rejection',
										icon: <IconBan style={iconStyle} />,
										content: (
											<>
												<CommentsTimeline rejectedComments={rejectedComments} />
												<Button href="request" linkAs={RouterLink} icon={<IconRepeat />}>
													{t('routes.ProjectDetail.rejectedComments.request')}
												</Button>
											</>
										)
									}
								]
							: []),
						{
							id: 'projectInfo',
							label: 'Project info',
							icon: <IconInfoCircle style={iconStyle} />,
							content: (
								<>
									<ProjectAllocationsTable id={project.id} />
									{project.status === ProjectStatus.ACTIVE && (
										<>
											<ProjectMembers id={project.id} />
											<ProjectPublications id={project.id} />
										</>
									)}
								</>
							)
						},
						{
							id: 'resourceUsage',
							label: 'Resource usage',
							icon: <IconInfoCircle style={iconStyle} />,
							content: (
								<>
									{isLoadingUsage && (
										<Group justify="center" py="xl">
											<Loader size="lg" />
										</Group>
									)}

									{!isLoadingUsage && usageData && (
										<Stack gap="md">
											<Group>
												{initialSources.length > 1 && (
													<Select
														label="Data source"
														placeholder="All sources"
														data={[
															{ value: '', label: 'All sources' },
															...initialSources.map((source: string) => ({
																value: source,
																label: source.toUpperCase()
															}))
														]}
														value={selectedSource}
														onChange={(value: string | null) =>
															setSelectedSource(value || null)
														}
														clearable
														style={{ minWidth: 200 }}
													/>
												)}

												{usageData.availableAllocations &&
													usageData.availableAllocations.length > 0 && (
														<Select
															label="Allocation / Job"
															placeholder="All allocations"
															data={[
																{ value: 'all', label: 'All' },
																...usageData.availableAllocations.map(
																	(alloc: ResourceUsageAllocationOption) => ({
																		value: alloc.id,
																		label: alloc.label
																	})
																)
															]}
															value={selectedAllocation}
															onChange={(value: string | null) =>
																setSelectedAllocation(value || 'all')
															}
															clearable
															style={{ minWidth: 250 }}
														/>
													)}
											</Group>

											{/* Static Metrics */}
											<StaticMetricsCard
												totalVcpus={usageData.totals.totalVcpus}
												storageBytesAllocated={usageData.totals.storageBytesAllocated}
												lastUpdated={usageData.totals.lastUpdated}
											/>

											<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
												<UsageChartCard
													title="CPU time"
													description="Total CPU seconds consumed per window"
													series={usageData.series}
													unitType="time"
													metrics={[
														{
															key: 'cpuTimeSeconds',
															label: 'CPU time'
														}
													]}
												/>
												<UsageChartCard
													title="CPU usage"
													description="Average CPU utilization percentage"
													series={usageData.series}
													unitType="percentage"
													metrics={[
														{
															key: 'cpuPercent',
															label: 'CPU %'
														}
													]}
												/>
												{!isOpenstackOnly && (
													<UsageChartCard
														title="Walltime"
														description="Elapsed time per window"
														series={usageData.series}
														unitType="time"
														metrics={[
															{
																key: 'walltimeSeconds',
																label: 'Walltime'
															}
														]}
													/>
												)}
												<UsageChartCard
													title="Memory"
													description="Allocated vs used RAM"
													series={usageData.series}
													unitType="memory"
													metrics={[
														{
															key: 'ramBytesAllocated',
															label: 'Allocated'
														},
														{
															key: 'ramBytesUsed',
															label: 'Used'
														}
													]}
												/>
											</SimpleGrid>
										</Stack>
									)}

									{!isLoadingUsage && !usageData && (
										<Box py="xl">
											<Text>No usage data available for this project yet.</Text>
										</Box>
									)}
								</>
							)
						}
					]}
				/>
			</Box>
		</Box>
	);
};

export default ProjectDetail;
