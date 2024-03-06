import React, {useContext, useState} from "react";
import {Platform, SafeAreaView} from "react-native";
import {Badge, Box, KeyboardAvoidingView, ScrollView, VStack} from "native-base";
import * as Yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";
import {Input} from "@/components/Forms/Input";
import {Button} from "@/components/Button";
import {updateUserMe} from "@/services/user";
import TranslationContext from "@/contexts/TranslationContext";
import AlertContext from "@/contexts/AlertContext";
import authContext from "@/contexts/AuthContext";
import AvatarUpdated from "@/components/AvatarUpdated";
import {handleErrors} from "@/utils/directus";
import {RadioInput} from "@/components/Forms/Radio";
import {HeaderDrawer} from "@/components/HeaderDrawer";

const signUpSchema = Yup.object({
    first_name: Yup.string().trim().min(2, 'O primeiro nome deve ter pelo menos 2 caracteres').required('O campo nome é obrigatório'),
    last_name: Yup.string().trim().min(2, 'O sobrenome deve ter pelo menos 2 caracteres').required('O campo sobrenome é obrigatório'),
    email: Yup.string().email('Digite um email válido').required('Email é obrigatório'),
    gender: Yup.string().required('O campo gênero deve ser preenchido'),
    location: Yup.string().trim().min(2, 'O campo localização é obrigatório').required('O campo localização é obrigatório'),
    description: Yup.string().trim().min(20, 'O campo descrição deve conter pelo menos 20 caracteres'),
})

type FormDataProps = Yup.InferType<typeof signUpSchema>;

export default function Index() {
    const {t} = useContext(TranslationContext);
    const alert = useContext(AlertContext)
    const {user, setUser} = useContext(authContext)

    const [loading, setLoading] = useState(false);

    const {control, handleSubmit, formState: {errors, isValid}} = useForm<FormDataProps>({
        resolver: yupResolver(signUpSchema),
        mode: 'all'
    });

    async function handleUpdateUser(dataUserForm: FormDataProps) {
        setLoading(true)
        try {
            const userData = {
                ...dataUserForm,
                title: t('member_unaadeb'),
            }
            const user = await updateUserMe(userData);
            await setUser(user)
            alert.success(`Atualizado com sucesso`)
        } catch (error) {
            const message = handleErrors(error.errors);
            alert.error(`Error ao atualizar o usuário: ${message}`)
        } finally {
            setLoading(false)
        }
    }

    const radioOptions = [
        {value: 'masculino', label: 'Masculino'},
        {value: 'feminino', label: 'Feminino'},
    ];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1}}
        >
            <ScrollView>
                    <VStack space={4} p={4} alignItems={"center"}>
                        <Box>
                            <AvatarUpdated userAvatarID={user?.avatar}/>
                        </Box>
                    </VStack>
                    <Box p={4}>
                        <VStack space={4}>
                            <Badge colorScheme="info" alignSelf="center" variant={"outline"}>
                                {user?.title}
                            </Badge>
                            <Controller
                                control={control}
                                name={'first_name'}
                                defaultValue={user?.first_name}  // adicionado defaultValue aqui
                                render={({field: {onChange, value}}) => ( // adicione "value" aqui
                                    <Input
                                        placeholder={'Primeiro nome'}
                                        value={value}  // altere para "value" aqui
                                        placeholderTextColor={'gray.400'}
                                        onChangeText={onChange}
                                        errorMessage={errors.first_name?.message}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                )}/>
                            <Controller
                                control={control}
                                name={'last_name'}
                                defaultValue={user?.last_name}  // adicionado defaultValue aqui
                                render={({field: {onChange, value}}) => ( // adicione "value" aqui
                                    <Input
                                        placeholder={'Segundo nome'}
                                        value={value}
                                        placeholderTextColor={'gray.400'}
                                        onChangeText={onChange}
                                        errorMessage={errors.last_name?.message}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                )}/>
                            <Controller
                                control={control}
                                name={'email'}
                                defaultValue={user?.email}
                                render={({field: {onChange, value}}) => (
                                    <Input
                                        type={'email'}
                                        placeholder={'Seu e-mail'}
                                        value={value}
                                        placeholderTextColor={'gray.400'}
                                        onChangeText={onChange}
                                        errorMessage={errors.email?.message}
                                    />
                                )}
                            />
                            {/*<Controller*/}
                            {/*    control={control}*/}
                            {/*    name={'phone'}*/}
                            {/*    defaultValue={user?.phone}*/}
                            {/*    render={({field: {onChange, value}}) => (*/}
                            {/*        <Input*/}
                            {/*            placeholder={'Telefone'}*/}
                            {/*            value={value}*/}
                            {/*            onChangeText={onChange}*/}
                            {/*            errorMessage={errors.phone?.message}*/}
                            {/*            mask={{*/}
                            {/*                type: 'cel-phone',*/}
                            {/*                options: {*/}
                            {/*                    maskType: 'BRL',*/}
                            {/*                    withDDD: true,*/}
                            {/*                    dddMask: '(99) ',*/}
                            {/*                }*/}
                            {/*            }}*/}
                            {/*        />*/}
                            {/*    )}*/}
                            {/*/>*/}
                            {/*<Controller*/}
                            {/*    control={control}*/}
                            {/*    name={'gender'}*/}
                            {/*    defaultValue={user?.gender}*/}
                            {/*    render={({field: {onChange, value}}) => (*/}
                            {/*        <RadioInput*/}
                            {/*            message={'Escolha o seu gênero:'}*/}
                            {/*            errorMessage={errors.gender?.message}*/}
                            {/*            options={[*/}
                            {/*                {value: 'masculino', label: 'Masculino'},*/}
                            {/*                {value: 'feminino', label: 'Feminino'},*/}
                            {/*            ]}*/}
                            {/*            value={value}*/}
                            {/*            onChange={onChange}*/}
                            {/*        />*/}
                            {/*    )}*/}
                            {/*/>*/}
                            <Controller
                                control={control}
                                name={'location'}
                                defaultValue={user?.location}
                                render={({field: {onChange, value}}) => (
                                    <Input
                                        value={value}
                                        placeholder={'Sua localização, endereço'}
                                        placeholderTextColor={'gray.400'}
                                        onChangeText={onChange}
                                        errorMessage={errors.location?.message}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name={'description'}
                                defaultValue={user?.description}
                                render={({field: {onChange, value}}) => (
                                    <Input
                                        value={value}
                                        placeholder={'Escreva uma descrição sobre você!'}
                                        placeholderTextColor={'gray.400'}
                                        onChangeText={onChange}
                                        errorMessage={errors.description?.message}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name={'gender'}
                                defaultValue={user?.gender}
                                render={({field: {onChange, value}}) => (
                                    <RadioInput
                                        message="Qual o seu gênero?"
                                        value={value}
                                        options={radioOptions}
                                        onChange={onChange}
                                        errorMessage={errors.gender?.message}
                                    />
                                )}
                            />
                        </VStack>
                        <Box>
                            <Button title={'Atualizar cadastro'}
                                    height={12}
                                    mt="2"
                                    onPress={handleSubmit(handleUpdateUser)}
                                    isLoading={loading}
                                    isLoadingText="Cadastrando..."/>
                        </Box>
                    </Box>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};