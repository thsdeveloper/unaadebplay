import React, {useContext, useState} from "react";
import {View, Text, Platform} from "react-native";
import {Badge, Box, KeyboardAvoidingView, Link, ScrollView, VStack} from "native-base";
import * as Yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";
import {Input} from "../../../components/input";
import {Button} from "../../../components/Button";
import {emailExists, updateUserMe} from "../../../services/user";
import ConfigContext from "../../../contexts/ConfigContext";
import TranslationContext from "../../../contexts/TranslationContext";
import AlertContext from "../../../contexts/AlertContext";
import authContext from "../../../contexts/AuthContext";
import AvatarUpdated from "../../../components/AvatarUpdated";
import {RadioInput} from "../../../components/Radio";
import {handleErrors} from "../../../services/api";


const signUpSchema = Yup.object({
    first_name: Yup.string().trim().min(2, 'O primeiro nome deve ter pelo menos 2 caracteres').required('O campo nome é obrigatório'),
    last_name: Yup.string().trim().min(2, 'O sobrenome deve ter pelo menos 2 caracteres').required('O campo sobrenome é obrigatório'),
    email: Yup.string().email('Digite um email válido').required('Email é obrigatório'),
    // password: Yup.string().min(4, 'Senha deve ter no mínimo 4 caracteres').required('Senha é obrigatória'),
    // password_confirmed: Yup.string().oneOf([Yup.ref('password'), null], 'As senhas não coincidem.'),
    gender: Yup.string().required('O campo gênero é obrigatório'),
    location: Yup.string().trim().min(2, 'O campo localização é obrigatório').required('O campo localização é obrigatório'),
    description: Yup.string().trim().min(20, 'O campo descrição deve conter pelo menos 20 caracteres'),
})

type FormDataProps = Yup.InferType<typeof signUpSchema>;

export default function Settings({navigation}: { navigation: any }) {
    const config = useContext(ConfigContext);
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
                description: t('member_description'),
            }
            console.log('UserData >>', userData)

            const {data} = await updateUserMe(userData);

            await setUser(data.data)
            alert.success(`Usuário ${data.data.first_name} atualizado com sucesso`)
        } catch (error) {
            const message = handleErrors(error.response.data.errors);
            alert.error(`Error ao atualizar o usuário: ${message}`)
        } finally {
            setLoading(false)
        }
    }

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
                        {/*    name={'password'}*/}
                        {/*    defaultValue={user?.password}*/}
                        {/*    render={({field: {onChange, value}}) => (*/}
                        {/*        <Input*/}
                        {/*            isPassword={true}*/}
                        {/*            type={'password'}*/}
                        {/*            placeholder={'Senha'}*/}
                        {/*            placeholderTextColor={'gray.400'}*/}
                        {/*            onChangeText={onChange}*/}
                        {/*            value={value}*/}
                        {/*            errorMessage={errors.password?.message}*/}
                        {/*            autoCapitalize="none"*/}
                        {/*            autoCorrect={false}*/}
                        {/*        />*/}
                        {/*    )}/>*/}
                        {/*<Controller*/}
                        {/*    control={control}*/}
                        {/*    name={'password_confirmed'}*/}
                        {/*    defaultValue={user?.password}*/}
                        {/*    render={({field: {onChange, value}}) => (*/}
                        {/*        <Input*/}
                        {/*            isPassword={true}*/}
                        {/*            type={'password'}*/}
                        {/*            value={value}*/}
                        {/*            placeholder={'Confirme a senha'}*/}
                        {/*            placeholderTextColor={'gray.400'}*/}
                        {/*            onChangeText={onChange}*/}
                        {/*            errorMessage={errors.password_confirmed?.message}*/}
                        {/*            autoCapitalize="none"*/}
                        {/*            autoCorrect={false}*/}
                        {/*        />*/}
                        {/*    )}/>*/}
                        <Controller
                            control={control}
                            name={'gender'}
                            defaultValue={user?.gender}
                            render={({field: {onChange, value}}) => (
                                <RadioInput
                                    message={'Escolha o seu gênero:'}
                                    errorMessage={errors.gender?.message}
                                    options={[
                                        {value: 'masculino', label: 'Masculino'},
                                        {value: 'feminino', label: 'Feminino'},
                                    ]}
                                    value={value}
                                    onChange={onChange}
                                />
                            )}
                        />
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