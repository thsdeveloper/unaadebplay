import { z } from 'zod';

/**
 * Sign-up contract (ported from the mobile Yup schema, decoupled from the
 * async `emailExists` check — email-uniqueness is enforced by the API/Supabase).
 */
export const signUpSchema = z
  .object({
    first_name: z.string().trim().min(2, 'O primeiro nome deve ter pelo menos 2 caracteres'),
    last_name: z.string().trim().min(2, 'O sobrenome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Digite um email válido'),
    password: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres'),
    sector: z.string().min(1, 'Escolha seu setor'),
    gender: z.string().min(1, 'O campo sexo deve ser preenchido'),
    phone: z
      .string()
      .regex(/^(\([0-9]{2}\)\s)?([0-9]{4,5}-[0-9]{4})$/, 'Número de telefone inválido'),
    birthdate: z.string().min(1, 'O campo Data de Nascimento deve ser preenchido'),
    password_confirmed: z.string().optional(),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, 'Você deve aceitar os Termos de Uso e a Política de Privacidade'),
    email_responsavel: z.string().email('Digite um email válido').optional(),
    nome_responsavel: z.string().optional(),
    telefone_responsavel: z.string().optional(),
  })
  .refine((d) => !d.password_confirmed || d.password_confirmed === d.password, {
    message: 'As senhas não coincidem.',
    path: ['password_confirmed'],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});
export type SignInInput = z.infer<typeof signInSchema>;
