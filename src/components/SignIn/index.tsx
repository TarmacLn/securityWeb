import {
    Button,
    Divider,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    Stack,
    Typography,
} from '@mui/joy';
import { Link } from 'react-router';
import { useState } from 'react';
import { userStore } from '../../stores';
import { validateEmail, validatePassword } from '../../utils/validation';
import { sanitizeEmail, sanitizePassword } from '../../utils/sanitization';
import type { SignInFormElement } from '../types';

export default function SignIn() {
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');

    const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const result = validateEmail(e.target.value);
        setEmailError(result.error || '');
    };

    const handlePasswordBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const result = validatePassword(e.target.value);
        setPasswordError(result.error || '');
    };

    const handleSubmit = async (
        event: React.FormEvent<SignInFormElement>,
    ) => {
        event.preventDefault();
        
        const formElements = event.currentTarget.elements;
        const email = formElements.email.value;
        const password = formElements.password.value;

        // Validate inputs
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);

        setEmailError(emailValidation.error || '');
        setPasswordError(passwordValidation.error || '');

        if (!emailValidation.isValid || !passwordValidation.isValid) {
            return;
        }

        // Sanitize inputs
        const sanitizedData = {
            email: sanitizeEmail(email),
            password: sanitizePassword(password),
        };

        await userStore.login(sanitizedData);
    };

    return (
        <>
            <Stack sx={{ gap: 4, mb: 2 }}>
                <Stack sx={{ gap: 1 }}>
                    <Typography component='h1' level='h3'>
                        Sign in
                    </Typography>
                    <Typography level='body-sm'>
                        New to company? <Link to='/auth/register'>Sign up</Link>
                    </Typography>
                </Stack>
            </Stack>
            <Divider
                sx={(theme) => ({
                    [theme.getColorSchemeSelector('light')]: {
                        color: { xs: '#FFF', md: 'text.tertiary' },
                    },
                })}
            >
                or
            </Divider>
            <Stack sx={{ gap: 4, mt: 2 }}>
                <form onSubmit={handleSubmit}>
                    <FormControl required error={!!emailError}>
                        <FormLabel>Email</FormLabel>
                        <Input
                            type='email'
                            name='email'
                            onBlur={handleEmailBlur}
                        />
                        {emailError && (
                            <FormHelperText>{emailError}</FormHelperText>
                        )}
                    </FormControl>
                    <FormControl required error={!!passwordError} sx={{ mt: 2 }}>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type='password'
                            name='password'
                            onBlur={handlePasswordBlur}
                        />
                        {passwordError && (
                            <FormHelperText>{passwordError}</FormHelperText>
                        )}
                    </FormControl>
                    <Stack sx={{ gap: 4, mt: 2 }}>
                        <Button type='submit' fullWidth>
                            Sign in
                        </Button>
                    </Stack>
                </form>
            </Stack>
        </>
    );
}
