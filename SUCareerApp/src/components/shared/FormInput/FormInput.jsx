import "./FormInput.css";

const FormInput = ({
	label,
	id,
	wrapperClassName = "su-input-group",
	labelClassName = "su-input-label",
	inputClassName = "su-input",
	...inputProps
}) => {
	const inputId = id || inputProps.name;

	return (
		<div className={wrapperClassName}>
			{label ? <label className={labelClassName} htmlFor={inputId}>{label}</label> : null}
			<input id={inputId} className={inputClassName} {...inputProps} />
		</div>
	);
};

export default FormInput;
