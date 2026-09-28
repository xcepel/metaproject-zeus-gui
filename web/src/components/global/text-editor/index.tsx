import { Link, RichTextEditor, type RichTextEditorProps } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { useFormContext } from 'react-hook-form';
import { InputWrapper } from '@mantine/core';
import { Placeholder } from '@tiptap/extension-placeholder';

import classes from './text-editor.module.css';

type TextEditorProps = Omit<RichTextEditorProps, 'editor' | 'children'> & {
	inputHtmlName: string;
	label: string;
	description?: string;
};

const TextEditor = ({ inputHtmlName, label, description, placeholder, ...inputProps }: TextEditorProps) => {
	const form = useFormContext();

	const editor = useEditor({
		extensions: [StarterKit, Underline, Link, Placeholder.configure({ placeholder })],
		content: form?.getValues(inputHtmlName),
		onUpdate: ({ editor }) => {
			form.setValue(inputHtmlName, editor.getHTML());
		}
	});

	return (
		<InputWrapper
			label={label}
			description={description}
			withAsterisk
			error={form.formState.errors[inputHtmlName]?.message as string}
			{...form.register(inputHtmlName)}
		>
			<RichTextEditor {...inputProps} editor={editor} mt={10}>
				<RichTextEditor.Toolbar sticky stickyOffset="var(--mc-header-height)">
					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Bold />
						<RichTextEditor.Italic />
						<RichTextEditor.Underline />
						<RichTextEditor.Strikethrough />
						<RichTextEditor.ClearFormatting />
						<RichTextEditor.Code />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.H2 />
						<RichTextEditor.H3 />
						<RichTextEditor.H4 />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Blockquote />
						<RichTextEditor.BulletList />
						<RichTextEditor.OrderedList />
						<RichTextEditor.Subscript />
						<RichTextEditor.Superscript />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Link />
						<RichTextEditor.Unlink />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.AlignLeft />
						<RichTextEditor.AlignCenter />
						<RichTextEditor.AlignJustify />
						<RichTextEditor.AlignRight />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Undo />
						<RichTextEditor.Redo />
					</RichTextEditor.ControlsGroup>
				</RichTextEditor.Toolbar>

				<RichTextEditor.Content className={classes.content} />
			</RichTextEditor>
		</InputWrapper>
	);
};
export default TextEditor;
