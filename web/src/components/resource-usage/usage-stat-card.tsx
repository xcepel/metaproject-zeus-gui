import { Stack, Text, Group, ThemeIcon } from '@mantine/core';
import { Card } from '@metacentrum/design-system';
import { ReactNode } from 'react';

interface UsageStatCardProps {
	title: string;
	value: string;
	description?: string;
	icon?: ReactNode;
}

export const UsageStatCard = ({ title, value, description, icon }: UsageStatCardProps) => (
	<Card>
		<Group align="flex-start" gap="md">
			{icon && (
				<ThemeIcon size="lg" variant="light" color="blue">
					{icon}
				</ThemeIcon>
			)}
			<Stack gap={4}>
				<Text size="sm" c="dimmed">
					{title}
				</Text>
				<Text fw={600} fz="xl">
					{value}
				</Text>
				{description && (
					<Text size="sm" c="dimmed">
						{description}
					</Text>
				)}
			</Stack>
		</Group>
	</Card>
);

export default UsageStatCard;
