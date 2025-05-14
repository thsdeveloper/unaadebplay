import {Button as NativeBaseButton} from '@/components/ui/button'
import {IButtonProps} from "@gluestack-ui/button/lib/types";

type Props = IButtonProps & {
    title: string;
}

export function Button({title, ...rest}: Props){
    return (
        <NativeBaseButton backgroundColor={'#E51C44'} {...rest} height={12} rounded={'full'}>
            <Text color={'white'}>{title}</Text>
        </NativeBaseButton>
    )
}
