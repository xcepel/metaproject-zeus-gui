import { Flex, TextInput } from '@mantine/core';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { IconSend } from '@tabler/icons-react';
import { Button } from '@metacentrum/design-system';

import TextEditor from '@/components/global/text-editor';
import { type RequestProjectSchema } from '@/modules/project/form';

type RequestFormProps = {
	onSubmit: (values: RequestProjectSchema) => void;
	loading: boolean;
	submitText: string;
};

const RequestForm = ({ loading, onSubmit, submitText }: RequestFormProps) => {
	const form = useFormContext<RequestProjectSchema>();

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<TextInput
				label="Title"
				withAsterisk
				placeholder="My title"
				error={form.formState.errors.title?.message as string}
				{...form.register('title')}
			/>
			<TextInput
				label="Link"
				withAsterisk
				placeholder="https://muni.cz/"
				description="Link with information to the project. Used to make review process faster, if project is already approved somewhere else."
				error={form.formState.errors.link?.message as string}
				{...form.register('link')}
			/>
			<TextEditor
				label="Description"
				inputHtmlName="description"
				placeholder="My project description talking about project..."
			/>
			<Flex justify="center">
				<Button
					loading={loading}
					icon={<IconSend />}
					type="submit"
					variant="primary"
					style={{ marginTop: 10, width: 200 }}
				>
					{submitText}
				</Button>
			</Flex>
		</form>
	);
};

export default RequestForm;
