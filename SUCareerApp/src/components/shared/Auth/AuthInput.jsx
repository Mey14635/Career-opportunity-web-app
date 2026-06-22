import FormInput from "../FormInput/FormInput";

const AuthInput = ({ label, ...inputProps }) => {
  return <FormInput label={label} wrapperClassName="form-group" labelClassName="" inputClassName="" {...inputProps} />;
};

export default AuthInput;
