import { Button as NativeBaseButton } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof NativeBaseButton> & {
    title: string;
}

export function Button({title, ...rest}: Props){
    return (
        <NativeBaseButton backgroundColor={'#E51C44'} {...rest} height={12} rounded={'full'}>
            <Text color={'white'}>{title}</Text>
        </NativeBaseButton>
    )
}
