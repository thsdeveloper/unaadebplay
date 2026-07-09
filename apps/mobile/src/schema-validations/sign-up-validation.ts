import * as Yup from "yup";
import {ObjectSchema} from "yup";
import {emailExists} from "@/services/user";

export function validateSchemaSignUp(isMinor: boolean): ObjectSchema<any>{
    return Yup.object({
        first_name: Yup.string().trim().min(2, 'O primeiro nome deve ter pelo menos 2 caracteres').required('O primeiro nome é obrigatório'),
        last_name: Yup.string().trim().min(2, 'O sobrenome deve ter pelo menos 2 caracteres').required('O sobrenome é obrigatório'),
        email: Yup.string()
            .email('Digite um email válido')
            .required('Email é obrigatório')
            .test(
                'check-email-exists',
                'Este e-mail já está cadastrado',
                async (value) => {
                    const exists = await emailExists(value);
                    return !exists; // retornar true se o e-mail NÃO existir
                }
            ),
        password: Yup.string().min(4, 'Senha deve ter no mínimo 4 caracteres').required('Senha é obrigatória'),
        sector: Yup.string().required('Escolha seu setor'),
        gender: Yup.string().required('O campo sexo deve ser preenchido'),
        phone: Yup.string().required('O campo telefone deve ser preenchido').matches(
            /^(\([0-9]{2}\)\s)?([0-9]{4,5}-[0-9]{4})$/,
            'Número de telefone inválido'
        ),
        birthdate: Yup.string().required('O campo Data de Nascimento deve ser preenchido')
            .test('is-valid-date', 'Data de Nascimento inválida', (value) => {
                if (!value) return false; // verifica se o valor é nulo
                const parts = value.split('/');
                if (parts.length !== 3) return false; // verifica se a data está no formato DD/MM/AAAA

                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // mês é indexado a partir de 0
                const year = parseInt(parts[2], 10);

                const date = new Date(year, month, day);
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0); // zera as horas para comparar apenas a data

                // Verifica se a data é válida e se não é uma data futura
                return date && date.getMonth() === month && date.getDate() === day && date.getFullYear() === year && date <= currentDate;
            }),
        password_confirmed: Yup.string().oneOf([Yup.ref('password')], 'As senhas não coincidem.'),
        acceptTerms: Yup.boolean().oneOf([true], 'Você deve aceitar os Termos de Uso e a Política de Privacidade para se cadastrar'),
        email_responsavel: Yup.string()
            .email('Digite um email válido')
            .when('birthdate', (birthdate, schema) => {
                return isMinor ? schema.required('Email do responsável é obrigatório') : schema;
            }),
        nome_responsavel: Yup.string()
            .when('birthdate', (birthdate, schema) => {
                return isMinor ? schema.required('Nome do responsável é obrigatório') : schema;
            }),
        telefone_responsavel: Yup.string()
            .when('birthdate', (birthdate, schema) => {
                return isMinor ? schema.required('Telefone do responsável é obrigatório') : schema;
            }),
    });
}