import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./FormInput.css";

const FormInput = ({
	label,
	id,
	wrapperClassName = "su-input-group",
	labelClassName = "su-input-label",
	inputClassName = "su-input",
	...inputProps
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const inputId = id || inputProps.name;
	const isPassword = inputProps.type === "password";
	const inputType = isPassword && showPassword ? "text" : inputProps.type;

	return (
		<div className={wrapperClassName}>
			{label ? <label className={labelClassName} htmlFor={inputId}>{label}</label> : null}
			<div className={isPassword ? "su-password-input-wrap" : undefined}>
				<input
					id={inputId}
					className={`${inputClassName}${isPassword ? " su-password-input" : ""}`}
					{...inputProps}
					type={inputType}
				/>
				{isPassword ? (
					<button
						type="button"
						className="su-password-toggle"
						onClick={() => setShowPassword((current) => !current)}
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
					</button>
				) : null}
			</div>
		</div>
	);
};

export default FormInput;
