import { ErrorState } from '@metacentrum/design-system';
import { useTranslation } from 'react-i18next';

const ErrorAlert = () => {
	const { t } = useTranslation();

	return (
		<ErrorState
			title={t('components.global.errorAlert.title')}
			description={t('components.global.errorAlert.description')}
		/>
	);
};

export default ErrorAlert;
