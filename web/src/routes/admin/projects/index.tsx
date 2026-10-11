import { useTranslation } from 'react-i18next';
import { Box, Title } from '@mantine/core';
import type { DataTableSort } from '@metacentrum/design-system';
import React from 'react';

import PageBreadcrumbs from '@/components/global/page-breadcrumbs';
import ProjectAdminTable from '@/components/project/project-table/admin-table';
import type { Project } from '@/modules/project/model';
import { useAllProjectsQuery } from '@/modules/project/queries';
import { getSortQuery } from '@/modules/api/sorting/utils';
import { getCurrentRole } from '@/modules/auth/methods/getCurrentRole';
import { Role } from '@/modules/user/role';

const AllProjects = () => {
	const { t } = useTranslation();
	const role = getCurrentRole();
	const prefix = role === Role.ADMIN ? '/admin' : '/director';

	return (
		<Box>
			<PageBreadcrumbs
				links={[
					{ title: t(`components.global.drawerList.links.${role}.title`), href: prefix },
					{ title: t(`components.global.drawerList.links.${role}.link.projects`), href: `${prefix}/projects` }
				]}
			/>
			<Title order={2}>{t('routes.AllProjects.title')}</Title>
			<ProjectAdminTable
				useProjectQuery={(page: number, limit: number, sort: DataTableSort) =>
					useAllProjectsQuery(
						{
							page,
							limit
						},
						getSortQuery(sort.key, sort.direction)
					)
				}
				buildLink={(project: Project) => `/project/${project.id}`}
			/>
		</Box>
	);
};

export default AllProjects;
