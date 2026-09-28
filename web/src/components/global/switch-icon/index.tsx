import classes from './switch-icon.module.css';

const SwitchIcon = ({ checked }: { checked: boolean }) => (
	<span className={classes.track} data-checked={checked} aria-hidden="true">
		<span className={classes.thumb} />
	</span>
);

export default SwitchIcon;
