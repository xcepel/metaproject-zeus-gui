import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { modals } from '@mantine/modals';
import { useLocation, useNavigate } from 'react-router-dom';
import { type HeaderAction } from '@metacentrum/design-system';

import { StepUpAccess } from '@/modules/auth/model';
import { userStepDown } from '@/modules/auth/methods/userStepDown';
import { userStepUp } from '@/modules/auth/methods/userStepUp';
import { getMaxRole } from '@/modules/auth/methods/getMaxRole';
import { getStepUpAccess } from '@/modules/auth/methods/getStepUpAccess';
import { Role } from '@/modules/user/role';
import { useAdminContext } from '@/modules/auth/admin-context';
import SwitchIcon from '@/components/global/switch-icon';

const useStepUpAction = (): HeaderAction | undefined => {
	const { setCurrentRole } = useAdminContext();
	const stepUpAccess = getStepUpAccess();
	const maxRole = getMaxRole();
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [checked, setChecked] = useState(stepUpAccess === StepUpAccess.LOGGED);

	const toggle = () => {
		if (checked) {
			userStepDown();
			setCurrentRole(Role.USER);
			setChecked(false);

			if (pathname.includes('/admin')) {
				navigate('/project');
			}
			return;
		}

		modals.openConfirmModal({
			title: t(`components.global.stepUpToggle.${maxRole}.dialog.title`),
			centered: true,
			children: t(`components.global.stepUpToggle.${maxRole}.dialog.description`),
			labels: {
				confirm: t(`components.global.stepUpToggle.${maxRole}.dialog.confirm`),
				cancel: t(`components.global.stepUpToggle.${maxRole}.dialog.cancel`)
			},
			onConfirm: () => {
				userStepUp();
				setCurrentRole(maxRole);
				setChecked(true);
			}
		});
	};

	if (stepUpAccess === StepUpAccess.NONE || maxRole === Role.USER) {
		return undefined;
	}

	return {
		label: t(`components.global.stepUpToggle.${maxRole}.switchDescription`),
		icon: <SwitchIcon checked={checked} />,
		onClick: toggle,
		active: checked
	};
};

export default useStepUpAction;
