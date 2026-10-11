import { Box, Checkbox, Group, NumberInput, Select, Textarea, TextInput } from '@mantine/core';
import { Controller, useFormContext } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@metacentrum/design-system';

import CustomAttributes from '@/components/resource/attributes/custom-attributes';
import { type Attribute } from '@/modules/attribute/model';
import Loading from '@/components/global/loading';
import ErrorAlert from '@/components/global/error-alert';
import { type AddResourceSchema } from '@/modules/allocation/form';
import { QUANTITY_DEFAULT_VALUE, QUANTITY_LABEL } from '@/modules/attribute/constant';
import { type Resource, type ResourceDetail } from '@/modules/resource/model';
import { useResourceTypesQuery } from '@/modules/resource/api/resource-types';
import { useResourceListQuery } from '@/modules/resource/api/resources';
import { useResourceAttributesQuery } from '@/modules/attribute/api/resource-attributes';

type ResourceFormProps = {
	defaultValues?: ResourceDetail;
	isPending: boolean;
	attributes: Attribute[];
	setAttributes: (attributes: Attribute[]) => void;
	onSubmit: (data: AddResourceSchema) => void;
};

const ResourceForm = ({ isPending, attributes, setAttributes, onSubmit, defaultValues }: ResourceFormProps) => {
	const { t } = useTranslation();
	const [parentResources, setParentResources] = useState<Resource[]>([]);
	const [quantitySelect, setQuantitySelect] = useState(
		!!defaultValues?.attributes.find(a => a.key.startsWith('quantity_'))
	);
	const [quantityLabel, setQuantityLabel] = useState<string | undefined>(
		defaultValues?.attributes.find(a => a.key === QUANTITY_LABEL)?.value
	);
	const [quantityDefaultValue, setQuantityDefaultValue] = useState<string | undefined>(
		defaultValues?.attributes.find(a => a.key === QUANTITY_DEFAULT_VALUE)?.value
	);

	const {
		handleSubmit,
		register,
		formState: { errors },
		control
	} = useFormContext<AddResourceSchema>();

	const beforeSubmit = (data: AddResourceSchema) => {
		const chosenAttributes = [...attributes];

		if (quantitySelect && quantityLabel && quantityDefaultValue) {
			chosenAttributes.push({
				key: 'quantity_label',
				value: quantityLabel
			});
			chosenAttributes.push({
				key: 'quantity_default_value',
				value: quantityDefaultValue
			});
		}

		onSubmit({
			...data,
			attributes: chosenAttributes
		});
	};

	const {
		data: resourceTypes,
		isPending: isResourceTypePending,
		isError: isResourceTypeError
	} = useResourceTypesQuery();
	const { data: resources, isPending: isResourcesPending, isError: isResourcesError } = useResourceListQuery();
	const {
		data: resourceAttributes,
		isPending: isAttributesPending,
		isError: isAttributesError
	} = useResourceAttributesQuery();

	useEffect(() => {
		if (defaultValues?.resourceType.id && resources) {
			setParentResources(
				resources?.filter(resource => resource.resourceType.id === defaultValues.resourceType.id) ?? []
			);
		}
	}, [resources]);

	if (isResourceTypePending || isResourcesPending || isAttributesPending) {
		return <Loading />;
	}

	if (isResourceTypeError || isResourcesError || isAttributesError) {
		return <ErrorAlert />;
	}

	return (
		<form onSubmit={handleSubmit(beforeSubmit)}>
			<TextInput
				defaultValue={defaultValues?.name}
				my={10}
				label="Name"
				withAsterisk
				placeholder="Resource name"
				{...register('name')}
				error={errors.name?.message as string}
			/>
			<Textarea
				defaultValue={defaultValues?.description}
				label="Description"
				withAsterisk
				placeholder="Resource description"
				{...register('description')}
				error={errors.description?.message as string}
			/>
			<Controller
				control={control}
				name="resourceTypeId"
				defaultValue={defaultValues?.resourceType.id}
				render={({ field }) => (
					<Select
						value={field.value?.toString()}
						my={10}
						name={field.name}
						withAsterisk
						label={t('routes.ResourceAddPage.form.type.label')}
						placeholder={t('routes.ResourceAddPage.form.type.placeholder')}
						allowDeselect={false}
						data={resourceTypes.map(option => ({
							value: option.id.toString(),
							label: option.name
						}))}
						onChange={value => {
							if (value) {
								field.onChange(+value);
								setParentResources(
									resources?.filter(resource => resource.resourceType.id === +value) ?? []
								);
							}
						}}
						error={errors.resourceTypeId?.message as string}
					/>
				)}
			/>
			{parentResources.length > 0 && (
				<Controller
					control={control}
					name="parentResourceId"
					defaultValue={defaultValues?.parentResource?.id}
					render={({ field }) => (
						<Select
							value={field.value?.toString()}
							my={10}
							name={field.name}
							label={t('routes.ResourceAddPage.form.resource.label')}
							description={t('routes.ResourceAddPage.form.resource.description')}
							placeholder={t('routes.ResourceAddPage.form.resource.placeholder')}
							allowDeselect={false}
							data={parentResources.map(option => ({
								value: option.id.toString(),
								label: option.name
							}))}
							onChange={value => (value ? field.onChange(+value) : null)}
							error={errors.parentResourceId?.message as string}
						/>
					)}
				/>
			)}
			<Checkbox
				my={10}
				label={t('routes.ResourceAddPage.form.is_available.label')}
				description={t('routes.ResourceAddPage.form.is_available.description')}
				defaultChecked
				{...register('isAvailable')}
				error={errors.isAvailable?.message as string}
			/>
			<Box my={20}>
				<Checkbox
					checked={quantitySelect}
					onChange={() => {
						setQuantitySelect(!quantitySelect);
					}}
					my={10}
					label={t('routes.ResourceAddPage.form.allow_quantity.label')}
					description={t('routes.ResourceAddPage.form.allow_quantity.description')}
				/>
				{quantitySelect && (
					<Group grow my={10}>
						<TextInput
							value={quantityLabel}
							label={t('routes.ResourceAddPage.form.quantity_label.label')}
							description={t('routes.ResourceAddPage.form.quantity_label.description')}
							withAsterisk
							placeholder={t('routes.ResourceAddPage.form.quantity_label.placeholder')}
							onChange={e => setQuantityLabel(e.currentTarget.value)}
						/>
						<NumberInput
							value={quantityDefaultValue}
							label={t('routes.ResourceAddPage.form.quantity_default.label')}
							description={t('routes.ResourceAddPage.form.quantity_default.description')}
							withAsterisk
							placeholder={t('routes.ResourceAddPage.form.quantity_default.placeholder')}
							min={0}
							onChange={value => {
								setQuantityDefaultValue(value.toString());
							}}
						/>
					</Group>
				)}
			</Box>
			<CustomAttributes
				defaultAttributes={defaultValues?.attributes ?? []}
				attributes={resourceAttributes}
				setAttributes={attributes => setAttributes(attributes)}
			/>
			<Button variant="primary" loading={isPending} type="submit">
				{t('routes.ResourceAddPage.form.submit')}
			</Button>
		</form>
	);
};

export default ResourceForm;
