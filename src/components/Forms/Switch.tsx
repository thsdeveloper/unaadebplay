import {FormControl} from "@/components/ui/form-control";
import {HStack} from "@/components/ui/hstack";

export function Switch({ errorMessage = null, isInvalid, message, onChange, value, textTrue, textFalse, ...rest }) {
    const invalid = !!errorMessage || isInvalid;

    const handleChange = (newValue: boolean) => {
        onChange(newValue);
    };

    return (
        <FormControl isInvalid={invalid}>
            {message && (<Text>{message}</Text>)}
           <HStack alignItems={"center"} space={2}>
               {textFalse && (<Text>{textFalse}</Text>)}
               <SwitchNB isChecked={value} onToggle={handleChange} {...rest} />
               {textTrue && (<Text>{textTrue}</Text>)}
           </HStack>
            {invalid && (
                <FormControl.ErrorMessage>
                    {errorMessage}
                </FormControl.ErrorMessage>
            )}
        </FormControl>
    );
}


