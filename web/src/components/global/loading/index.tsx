import { LoadingState } from '@metacentrum/design-system';

type LoadingProps = {
	text?: string;
};

const Loading = ({ text }: LoadingProps) => <LoadingState label={text} />;

export default Loading;
