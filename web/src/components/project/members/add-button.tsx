import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@metacentrum/design-system';

import RouterLink from '@/components/global/router-link';

type AddButtonProps = {
	id: number;
};

const AddButton = ({ id }: AddButtonProps) => {
	const { t } = useTranslation();
	return (
		<Button href={`/project/${id}/members`} linkAs={RouterLink} variant="primary" icon={<IconPlus size={14} />}>
			{t('components.project.members.add_button.title')}
		</Button>
	);
};

export default AddButton;
