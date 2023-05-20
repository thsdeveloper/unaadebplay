import React, {useContext, useState} from "react";
import {View, Text} from "react-native";
import {Box, Link, VStack} from "native-base";
import * as Yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";
import {Input} from "../../../components/input";
import {Button} from "../../../components/Button";
import {AxiosError} from "axios";
import {handleErrors} from "../../../services/api";
import {updateUser} from "../../../services/user";
import ConfigContext from "../../../contexts/ConfigContext";
import TranslationContext from "../../../contexts/TranslationContext";
import AlertContext from "../../../contexts/AlertContext";
import authContext from "../../../contexts/AuthContext";
import AvatarUpdated from "../../../components/AvatarUpdated";


const signUpSchema = Yup.object({
    first_name: Yup.string().trim().min(2, 'O primeiro nome deve ter pelo menos 2 caracteres').required('O primeiro nome é obrigatório'),
})

type FormDataProps = Yup.InferType<typeof signUpSchema>;

export default function Settings({navigation}: { navigation: any }) {
    const config = useContext(ConfigContext);
    const {t} = useContext(TranslationContext);
    const alert = useContext(AlertContext)
    const {user} = useContext(authContext)

    const [loading, setLoading] = useState(false);

    const {control, handleSubmit, formState: {errors, isValid}} = useForm<FormDataProps>({
        resolver: yupResolver(signUpSchema),
    });

    async function handleUpdateUser(dataUserForm: FormDataProps) {
        setLoading(true)
        try {

            const userData = {
                ...dataUserForm,
                title: t('member_unaadeb'),
                description: t('member_description'),
                role: config.id_role_default,
            }


            const response = await updateUser(user.id, userData);

            alert.success(`Usuário ${user.first_name} cadastrado com sucesso`)

        } catch (error) {
            alert.error(`Usuário ao atualizar usuário`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View>
            <VStack space={4} p={4} alignItems={"center"}>
                <Box>
                    <AvatarUpdated userAvatarID={user?.avatar}/>
                </Box>
            </VStack>
            <Box p={4}>
                <Box>
                    <Controller
                        control={control}
                        name={'first_name'}
                        render={({field: {onChange}}) => (
                            <Input
                                placeholder={'Primeiro nome'}
                                value={user?.first_name}
                                placeholderTextColor={'gray.400'}
                                onChangeText={onChange}
                                errorMessage={errors.first_name?.message}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        )}/>
                </Box>

                <Box>
                    <Button title={'Atualizar cadastro'}
                            height={12}
                            mt="2"
                            onPress={handleSubmit(handleUpdateUser)}
                            isLoading={loading}
                            isLoadingText="Cadastrando..."/>
                </Box>
            </Box>

        </View>
    );
};