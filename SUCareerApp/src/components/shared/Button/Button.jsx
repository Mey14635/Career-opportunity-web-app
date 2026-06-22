import "./Button.css";

const Button = ({
	children,
	type = "button",
	variant = "primary",
	fullWidth = false,
	className = "",
	...buttonProps
}) => {
	const classes = [
		"su-btn",
		`su-btn-${variant}`,
		fullWidth ? "su-btn-full" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button type={type} className={classes} {...buttonProps}>
			{children}
		</button>
	);
};

export default Button;
