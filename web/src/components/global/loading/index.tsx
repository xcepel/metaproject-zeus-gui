import { Loader, rem, Stack, Text } from '@mantine/core';

import MainContentWrapper from '@/components/global/content-wrapper';

type LoadingProps = {
	text?: string;
};

const Loading = ({ text }: LoadingProps) => (
	<MainContentWrapper>
		<Stack align="center" py={rem(150)}>
			<Loader size={rem(40)} />
			{text && <Text>{text}</Text>}
		</Stack>
	</MainContentWrapper>
);

export default Loading;
