import React, {useContext, useState} from "react";
import {KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View} from "react-native";
import * as Yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Button} from "@/components/Button";
import {updateUserMe} from "@/services/user";
import TranslationContext from "@/contexts/TranslationContext";
import AlertContext from "@/contexts/AlertContext";
import authContext from "@/contexts/AuthContext";
import AvatarUpdated from "@/components/AvatarUpdated";
import {handleErrors} from "@/utils/directus";
import {RadioInput} from "@/components/Forms/Radio";
import {VStack} from "@/components/ui/vstack";
import {HStack} from "@/components/ui/hstack";
import {Box} from "@/components/ui/box";
import {Badge} from "@/components/ui/badge";
import {CustomInput} from "@/components/Forms/Input";
import {Link, router} from "expo-router";
import {Text} from "@/components/ui/text";
import {Heading} from "@/components/ui/heading";
import {Icon} from "@/components/ui/icon";
import {Divider} from "@/components/ui/divider";
import {Ionicons} from "@expo/vector-icons";

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
    const {user, setUser, logout} = useContext(authContext)

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
            className="flex-1 bg-gray-50 dark:bg-gray-900"
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section com Avatar */}
                <Box className="bg-white dark:bg-gray-800 pb-6">
                    <VStack space="md" alignItems="center" className="pt-4">
                        <AvatarUpdated userAvatarID={user?.avatar}/>
                        <VStack space="xs" alignItems="center">
                            <Heading size="lg" className="text-gray-900 dark:text-white">
                                {user?.first_name} {user?.last_name}
                            </Heading>
                            <Text className="text-gray-500 dark:text-gray-400">{user?.email}</Text>
                            <Badge colorScheme="info" variant="outline" className="mt-2">
                                <Text>{user?.title}</Text>
                            </Badge>
                        </VStack>
                    </VStack>
                </Box>

                {/* Quick Actions Section */}
                <Box className="px-4 -mt-4">
                    <Box className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
                        <HStack space="lg" className="justify-around">
                            <TouchableOpacity onPress={() => router.push('/(tabs)/(settings)/notification-settings')} className="items-center">
                                <Box className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-2">
                                    <Icon as={Ionicons} name="notifications-outline" size="lg" className="text-blue-600 dark:text-blue-400"/>
                                </Box>
                                <Text className="text-xs text-gray-600 dark:text-gray-300">Notificações</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => alert('Privacidade')} className="items-center">
                                <Box className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-2">
                                    <Icon as={Ionicons} name="lock-closed-outline" size="lg" className="text-green-600 dark:text-green-400"/>
                                </Box>
                                <Text className="text-xs text-gray-600 dark:text-gray-300">Privacidade</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => alert('Ajuda')} className="items-center">
                                <Box className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mb-2">
                                    <Icon as={Ionicons} name="help-circle-outline" size="lg" className="text-purple-600 dark:text-purple-400"/>
                                </Box>
                                <Text className="text-xs text-gray-600 dark:text-gray-300">Ajuda</Text>
                            </TouchableOpacity>
                        </HStack>
                    </Box>
                </Box>

                {/* Profile Information Section */}
                <Box className="px-4 mt-6">
                    <Heading size="md" className="mb-4 text-gray-900 dark:text-white">Informações do Perfil</Heading>
                    <Box className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
                        <VStack space="lg">
                            <Controller
                                control={control}
                                name={'first_name'}
                                defaultValue={user?.first_name}
                                render={({field: {onChange, value}}) => (
                                    <VStack space="xs">
                                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primeiro nome</Text>
                                        <CustomInput
                                            placeholder={'Digite seu primeiro nome'}
                                            value={value}
                                            placeholderTextColor={'gray.400'}
                                            onChangeText={onChange}
                                            errorMessage={errors.first_name?.message}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            className="bg-gray-50 dark:bg-gray-700"
                                        />
                                    </VStack>
                                )}/>
                            <Controller
                                control={control}
                                name={'last_name'}
                                defaultValue={user?.last_name}
                                render={({field: {onChange, value}}) => (
                                    <VStack space="xs">
                                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sobrenome</Text>
                                        <CustomInput
                                            placeholder={'Digite seu sobrenome'}
                                            value={value}
                                            placeholderTextColor={'gray.400'}
                                            onChangeText={onChange}
                                            errorMessage={errors.last_name?.message}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            className="bg-gray-50 dark:bg-gray-700"
                                        />
                                    </VStack>
                                )}/>
                            <Controller
                                control={control}
                                name={'email'}
                                defaultValue={user?.email}
                                render={({field: {onChange, value}}) => (
                                    <VStack space="xs">
                                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</Text>
                                        <CustomInput
                                            type={'email'}
                                            placeholder={'seu@email.com'}
                                            value={value}
                                            placeholderTextColor={'gray.400'}
                                            onChangeText={onChange}
                                            errorMessage={errors.email?.message}
                                            className="bg-gray-50 dark:bg-gray-700"
                                        />
                                    </VStack>
                                )}
                            />
                            <Controller
                                control={control}
                                name={'location'}
                                defaultValue={user?.location}
                                render={({field: {onChange, value}}) => (
                                    <VStack space="xs">
                                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localização</Text>
                                        <CustomInput
                                            value={value}
                                            placeholder={'Cidade, Estado'}
                                            placeholderTextColor={'gray.400'}
                                            onChangeText={onChange}
                                            errorMessage={errors.location?.message}
                                            className="bg-gray-50 dark:bg-gray-700"
                                        />
                                    </VStack>
                                )}
                            />
                            <Controller
                                control={control}
                                name={'description'}
                                defaultValue={user?.description}
                                render={({field: {onChange, value}}) => (
                                    <VStack space="xs">
                                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sobre você</Text>
                                        <CustomInput
                                            value={value}
                                            placeholder={'Conte um pouco sobre você...'}
                                            placeholderTextColor={'gray.400'}
                                            onChangeText={onChange}
                                            errorMessage={errors.description?.message}
                                            multiline
                                            numberOfLines={4}
                                            className="bg-gray-50 dark:bg-gray-700 min-h-[100px]"
                                        />
                                    </VStack>
                                )}
                            />
                            <Controller
                                control={control}
                                name={'gender'}
                                defaultValue={user?.gender}
                                render={({field: {onChange, value}}) => (
                                    <VStack space="xs">
                                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gênero</Text>
                                        <RadioInput
                                            message=""
                                            value={value}
                                            options={radioOptions}
                                            onChange={onChange}
                                            errorMessage={errors.gender?.message}
                                        />
                                    </VStack>
                                )}
                            />
                        </VStack>

                        <Button
                            title={'Salvar alterações'}
                            className="mt-6 bg-blue-600 dark:bg-blue-500"
                            onPress={handleSubmit(handleUpdateUser)}
                            isLoading={loading}
                            isLoadingText="Salvando..."
                        />
                    </Box>
                </Box>

                {/* Settings Menu Section */}
                <Box className="px-4 mt-6">
                    <Heading size="md" className="mb-4 text-gray-900 dark:text-white">Configurações</Heading>
                    <Box className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                        <VStack divider={<Divider />}>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/(settings)/notification-settings')}>
                                <HStack space="md" className="p-4 items-center">
                                    <Icon as={Ionicons} name="notifications-outline" size="md" className="text-gray-600 dark:text-gray-400"/>
                                    <VStack className="flex-1">
                                        <Text className="font-medium text-gray-900 dark:text-white">Notificações</Text>
                                        <Text className="text-sm text-gray-500 dark:text-gray-400">Gerencie suas preferências</Text>
                                    </VStack>
                                    <Icon as={Ionicons} name="chevron-forward" size="sm" className="text-gray-400"/>
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => alert('Privacidade e Segurança')}>
                                <HStack space="md" className="p-4 items-center">
                                    <Icon as={Ionicons} name="shield-checkmark-outline" size="md" className="text-gray-600 dark:text-gray-400"/>
                                    <VStack className="flex-1">
                                        <Text className="font-medium text-gray-900 dark:text-white">Privacidade e Segurança</Text>
                                        <Text className="text-sm text-gray-500 dark:text-gray-400">Proteja sua conta</Text>
                                    </VStack>
                                    <Icon as={Ionicons} name="chevron-forward" size="sm" className="text-gray-400"/>
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => alert('Aparência')}>
                                <HStack space="md" className="p-4 items-center">
                                    <Icon as={Ionicons} name="color-palette-outline" size="md" className="text-gray-600 dark:text-gray-400"/>
                                    <VStack className="flex-1">
                                        <Text className="font-medium text-gray-900 dark:text-white">Aparência</Text>
                                        <Text className="text-sm text-gray-500 dark:text-gray-400">Tema e personalização</Text>
                                    </VStack>
                                    <Icon as={Ionicons} name="chevron-forward" size="sm" className="text-gray-400"/>
                                </HStack>
                            </TouchableOpacity>
                        </VStack>
                    </Box>
                </Box>

                {/* Support Section */}
                <Box className="px-4 mt-6">
                    <Heading size="md" className="mb-4 text-gray-900 dark:text-white">Suporte</Heading>
                    <Box className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                        <VStack divider={<Divider />}>
                            <TouchableOpacity onPress={() => alert('Central de Ajuda')}>
                                <HStack space="md" className="p-4 items-center">
                                    <Icon as={Ionicons} name="help-circle-outline" size="md" className="text-gray-600 dark:text-gray-400"/>
                                    <VStack className="flex-1">
                                        <Text className="font-medium text-gray-900 dark:text-white">Central de Ajuda</Text>
                                        <Text className="text-sm text-gray-500 dark:text-gray-400">FAQs e tutoriais</Text>
                                    </VStack>
                                    <Icon as={Ionicons} name="chevron-forward" size="sm" className="text-gray-400"/>
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => alert('Fale Conosco')}>
                                <HStack space="md" className="p-4 items-center">
                                    <Icon as={Ionicons} name="chatbubbles-outline" size="md" className="text-gray-600 dark:text-gray-400"/>
                                    <VStack className="flex-1">
                                        <Text className="font-medium text-gray-900 dark:text-white">Fale Conosco</Text>
                                        <Text className="text-sm text-gray-500 dark:text-gray-400">Suporte direto</Text>
                                    </VStack>
                                    <Icon as={Ionicons} name="chevron-forward" size="sm" className="text-gray-400"/>
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => alert('Sobre')}>
                                <HStack space="md" className="p-4 items-center">
                                    <Icon as={Ionicons} name="information-circle-outline" size="md" className="text-gray-600 dark:text-gray-400"/>
                                    <VStack className="flex-1">
                                        <Text className="font-medium text-gray-900 dark:text-white">Sobre</Text>
                                        <Text className="text-sm text-gray-500 dark:text-gray-400">Versão do app e informações</Text>
                                    </VStack>
                                    <Icon as={Ionicons} name="chevron-forward" size="sm" className="text-gray-400"/>
                                </HStack>
                            </TouchableOpacity>
                        </VStack>
                    </Box>
                </Box>

                {/* Logout Button */}
                <Box className="px-4 mt-6 mb-8">
                    <TouchableOpacity onPress={logout} className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4">
                        <HStack space="md" className="items-center justify-center">
                            <Icon as={Ionicons} name="log-out-outline" size="md" className="text-red-600 dark:text-red-400"/>
                            <Text className="font-medium text-red-600 dark:text-red-400">Sair da conta</Text>
                        </HStack>
                    </TouchableOpacity>
                </Box>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
