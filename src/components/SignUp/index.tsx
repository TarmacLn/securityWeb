import { MedicalServices, Person } from '@mui/icons-material';
import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    List,
    ListItem,
    ListItemDecorator,
    Option,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Typography,
} from '@mui/joy';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { notificationStore, userStore } from '../../stores';
import { OfficeLocation, Speciality, UserType } from '../../types';
import type { SignInFormElement } from '../types';
import {
    validateEmail,
    validatePassword,
    validateFullName,
    validateLicenseID,
    validateAMKA,
    validateSelectField,
} from '../../utils/validation';
import {
    sanitizeEmail,
    sanitizePassword,
    sanitizeName,
    sanitizeAlphanumeric,
    sanitizeNumber,
} from '../../utils/sanitization';

const userTypes = [
    {
        label: 'Doctor',
        value: UserType.Doctor,
        icon: <MedicalServices />,
    },
    {
        label: 'Patient',
        value: UserType.Patient,
        icon: <Person />,
    },
];

interface FormErrors {
    email?: string;
    password?: string;
    fullName?: string;
    speciality?: string;
    licenceID?: string;
    officeLocation?: string;
    amka?: string;
}

export default function SignUp() {
    const [userType, setUserType] = useState(userTypes[0].value);
    const [errors, setErrors] = useState<FormErrors>({});
    const navigate = useNavigate();

    const validateForm = (formData: Record<string, any>): boolean => {
        const newErrors: FormErrors = {};

        const emailValidation = validateEmail(formData.email || '');
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.error;
        }

        const passwordValidation = validatePassword(formData.password || '');
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.error;
        }

        const nameValidation = validateFullName(formData.fullName || '');
        if (!nameValidation.isValid) {
            newErrors.fullName = nameValidation.error;
        }

        // Doctor
        if (userType === UserType.Doctor) {
            const specialityValidation = validateSelectField(
                formData.speciality || '',
            );
            if (!specialityValidation.isValid) {
                newErrors.speciality = specialityValidation.error;
            }

            const licenseValidation = validateLicenseID(formData.licenceID || '');
            if (!licenseValidation.isValid) {
                newErrors.licenceID = licenseValidation.error;
            }

            const locationValidation = validateSelectField(
                formData.officeLocation || '',
            );
            if (!locationValidation.isValid) {
                newErrors.officeLocation = locationValidation.error;
            }
        }

        //Patient
        if (userType === UserType.Patient) {
            const amkaValidation = validateAMKA(formData.amka || '');
            if (!amkaValidation.isValid) {
                newErrors.amka = amkaValidation.error;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent<SignInFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());

        if (!validateForm(formJson)) {
            return;
        }

        const sanitizedData = {
            email: sanitizeEmail(formJson.email),
            password: sanitizePassword(formJson.password),
            fullName: sanitizeName(formJson.fullName),
            speciality: formJson.speciality,
            licenceID: sanitizeAlphanumeric(formJson.licenceID),
            officeLocation: formJson.officeLocation,
            amka: sanitizeNumber(formJson.amka),
            userType,
        };

        const registered = await userStore.register(sanitizedData as any);
        if (registered) {
            notificationStore.setNotification(
                true,
                'User registered successfully',
                'success',
            );
            navigate('/auth/login');
        }
    };

    return (
        <>
            <Stack sx={{ gap: 4, mb: 2 }}>
                <Stack sx={{ gap: 1 }}>
                    <Typography component='h1' level='h3'>
                        Sign Up
                    </Typography>
                    <Typography level='body-sm'>
                        Already a user? <Link to='/auth/login'>Sign In</Link>
                    </Typography>
                </Stack>
            </Stack>
            <Stack sx={{ gap: 4, mt: 2 }}>
                <RadioGroup name='userType' defaultValue={userTypes[0].value}>
                    <List
                        orientation='horizontal'
                        sx={{
                            '--List-gap': '0.5rem',
                            '--ListItem-paddingY': '1rem',
                            '--ListItem-radius': '8px',
                            '--ListItemDecorator-size': '32px',
                        }}
                    >
                        {userTypes.map((type, index) => (
                            <ListItem
                                variant='outlined'
                                key={type.value}
                                sx={{ boxShadow: 'sm' }}
                            >
                                <ListItemDecorator>
                                    {[<MedicalServices />, <Person />][index]}
                                </ListItemDecorator>
                                <Radio
                                    overlay
                                    value={type.value}
                                    label={type.label}
                                    onChange={(event) => {
                                        setUserType(
                                            event.target.value as UserType,
                                        );
                                    }}
                                    sx={{
                                        flexGrow: 1,
                                        flexDirection: 'row-reverse',
                                    }}
                                    slotProps={{
                                        action: ({ checked }) => ({
                                            sx: (theme) => ({
                                                ...(checked && {
                                                    inset: -1,
                                                    border: '2px solid',
                                                    borderColor:
                                                        theme.vars.palette
                                                            .primary[500],
                                                }),
                                            }),
                                        }),
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </RadioGroup>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <FormControl required error={!!errors.email}>
                            <FormLabel>Email</FormLabel>
                            <Input type='email' name='email' />
                            {errors.email && (
                                <FormHelperText>{errors.email}</FormHelperText>
                            )}
                        </FormControl>
                        <FormControl required error={!!errors.password}>
                            <FormLabel>Password</FormLabel>
                            <Input
                                type='password'
                                name='password'
                                slotProps={{
                                    input: {
                                        autoComplete: 'new-password',
                                    },
                                }}
                            />
                            {errors.password && (
                                <FormHelperText>{errors.password}</FormHelperText>
                            )}
                        </FormControl>
                        <FormControl required error={!!errors.fullName}>
                            <FormLabel>Full Name</FormLabel>
                            <Input type='text' name='fullName' />
                            {errors.fullName && (
                                <FormHelperText>{errors.fullName}</FormHelperText>
                            )}
                        </FormControl>
                        {userType === 'DOCTOR' && (
                            <>
                                <FormControl required error={!!errors.speciality}>
                                    <FormLabel>Specialization</FormLabel>
                                    <Select
                                        name='speciality'
                                        placeholder='Select Specialization'
                                    >
                                        {Object.keys(Speciality).map((key) => (
                                            <Option
                                                key={key}
                                                value={
                                                    Speciality[
                                                        key as keyof typeof Speciality
                                                    ]
                                                }
                                            >
                                                {
                                                    Speciality[
                                                        key as keyof typeof Speciality
                                                    ]
                                                }
                                            </Option>
                                        ))}
                                    </Select>
                                    {errors.speciality && (
                                        <FormHelperText>
                                            {errors.speciality}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                                <FormControl
                                    required
                                    error={!!errors.licenceID}
                                >
                                    <FormLabel>License ID</FormLabel>
                                    <Input type='text' name='licenceID' />
                                    {errors.licenceID && (
                                        <FormHelperText>
                                            {errors.licenceID}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                                <FormControl
                                    required
                                    error={!!errors.officeLocation}
                                >
                                    <FormLabel>Office Location</FormLabel>
                                    <Select
                                        name='officeLocation'
                                        placeholder='Select Office Location'
                                    >
                                        {Object.keys(OfficeLocation).map(
                                            (key) => (
                                                <Option
                                                    key={key}
                                                    value={
                                                        OfficeLocation[
                                                            key as keyof typeof OfficeLocation
                                                        ]
                                                    }
                                                >
                                                    {key}
                                                </Option>
                                            ),
                                        )}
                                    </Select>
                                    {errors.officeLocation && (
                                        <FormHelperText>
                                            {errors.officeLocation}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </>
                        )}
                        {userType === 'PATIENT' && (
                            <FormControl required error={!!errors.amka}>
                                <FormLabel>AMKA</FormLabel>
                                <Input type='text' name='amka' />
                                {errors.amka && (
                                    <FormHelperText>{errors.amka}</FormHelperText>
                                )}
                            </FormControl>
                        )}
                        <Stack sx={{ gap: 4, mt: 2 }}>
                            <Button type='submit' fullWidth>
                                Create Account
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Stack>
        </>
    );
}
