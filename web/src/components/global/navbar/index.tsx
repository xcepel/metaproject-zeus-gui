import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import {
	IconActivity,
	IconArchive,
	IconBan,
	IconClockQuestion,
	IconCpu,
	IconDeviceDesktopAnalytics,
	IconDevices2,
	IconLibrary,
	IconPodium,
	IconQuestionMark,
	IconReport,
	IconUserUp
} from '@tabler/icons-react';
import { Header, type HeaderNavItem } from '@metacentrum/design-system';

import { useAdminContext } from '@/modules/auth/admin-context';
import { IS_USER_STEP_UP, MAX_ROLE } from '@/modules/auth/constants';
import { Role } from '@/modules/user/role';
import useStepUpAction from '@/hooks/useStepUpAction';
import RouterLink from '@/components/global/router-link';

type LinkNode = {
	title: string;
	href: string;
	icon: React.ReactNode;
	links?: LinkNode[];
};

const ICON_SIZE = 18;

const projectLinks: LinkNode = {
	title: 'components.global.drawerList.links.projects.title',
	href: '/project',
	icon: <IconReport size={ICON_SIZE} />,
	links: [
		{
			title: 'components.global.drawerList.links.projects.active',
			href: '/project?status=active',
			icon: <IconActivity size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.projects.requested',
			href: '/project?status=requested',
			icon: <IconClockQuestion size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.projects.archived',
			href: '/project?status=archived',
			icon: <IconArchive size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.projects.rejected',
			href: '/project?status=rejected',
			icon: <IconBan size={ICON_SIZE} />
		}
	]
};

const publicationsLink: LinkNode = {
	title: 'components.global.drawerList.links.publications.title',
	href: '/publications',
	icon: <IconLibrary size={ICON_SIZE} />
};

const adminLinks: LinkNode = {
	title: 'components.global.drawerList.links.admin.title',
	href: '/admin',
	icon: <IconUserUp size={ICON_SIZE} />,
	links: [
		{
			title: 'components.global.drawerList.links.admin.link.allocations',
			href: '/admin/allocations',
			icon: <IconCpu size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.admin.link.projects',
			href: '/admin/projects',
			icon: <IconReport size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.admin.link.resources',
			href: '/admin/resources',
			icon: <IconDevices2 size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.admin.link.requests',
			href: '/admin/requests',
			icon: <IconQuestionMark size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.admin.link.allocation_requests',
			href: '/admin/allocation-requests',
			icon: <IconDeviceDesktopAnalytics size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.admin.link.stages',
			href: '/admin/stages',
			icon: <IconPodium size={ICON_SIZE} />
		}
	]
};

const directorLinks: LinkNode = {
	title: 'components.global.drawerList.links.director.title',
	href: '/director',
	icon: <IconUserUp size={ICON_SIZE} />,
	links: [
		{
			title: 'components.global.drawerList.links.director.link.allocations',
			href: '/director/allocations',
			icon: <IconCpu size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.director.link.projects',
			href: '/director/projects',
			icon: <IconReport size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.director.link.resources',
			href: '/director/resources',
			icon: <IconDevices2 size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.director.link.requests',
			href: '/director/requests',
			icon: <IconQuestionMark size={ICON_SIZE} />
		},
		{
			title: 'components.global.drawerList.links.director.link.allocation_requests',
			href: '/director/allocation-requests',
			icon: <IconDeviceDesktopAnalytics size={ICON_SIZE} />
		}
	]
};

const Navbar = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { pathname, search } = useLocation();
	const { isAuthenticated, user, removeUser, revokeTokens } = useAuth();
	const { currentRole } = useAdminContext();
	const stepUpAction = useStepUpAction();

	const isChildActive = (href: string) =>
		href.includes('?') ? `${pathname}${search}` === href : pathname.startsWith(href);

	const toNavItem = ({ title, href, icon, links }: LinkNode): HeaderNavItem => ({
		label: t(title),
		icon,
		href: links ? undefined : href,
		active: pathname.startsWith(href),
		children: links?.map(link => ({
			label: t(link.title),
			href: link.href,
			icon: link.icon,
			active: isChildActive(link.href)
		}))
	});

	const links: LinkNode[] = [projectLinks, publicationsLink];
	if (currentRole === Role.ADMIN) {
		links.push(adminLinks);
	}
	if (currentRole === Role.DIRECTOR) {
		links.push(directorLinks);
	}

	const logout = async () => {
		localStorage.removeItem(MAX_ROLE);
		localStorage.removeItem(IS_USER_STEP_UP);
		await removeUser();
		await revokeTokens();
		navigate('/');
	};

	return (
		<Header
			title={t('components.global.navbar.header')}
			logo={<img className="mc-header__logo" src="/images/zeus.png" alt="" />}
			linkAs={RouterLink}
			navItems={isAuthenticated ? links.map(toNavItem) : []}
			actions={stepUpAction ? [stepUpAction] : []}
			user={
				user
					? {
							firstName: user.profile.given_name ?? user.profile.name ?? '',
							lastName: user.profile.family_name ?? ''
						}
					: undefined
			}
			onLogout={user ? logout : undefined}
			logoutLabel={t('components.global.navbar.logout')}
			openMenuLabel={t('components.global.navbar.openMenu')}
			closeMenuLabel={t('components.global.navbar.closeMenu')}
		/>
	);
};

export default Navbar;
