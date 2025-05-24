declare module '@hookform/resolvers/yup' {
  import { Resolver } from 'react-hook-form';
  import * as Yup from 'yup';

  export function yupResolver<TFieldValues extends Record<string, any>>(
    schema: Yup.ObjectSchema<any>
  ): Resolver<TFieldValues>;
}