import { PinDropRounded } from '@mui/icons-material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NumbersIcon from '@mui/icons-material/Numbers';
import Phone from '@mui/icons-material/PhoneRounded';
import { Option, Select, Textarea } from '@mui/joy';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardActions from '@mui/joy/CardActions';
import CardOverflow from '@mui/joy/CardOverflow';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { userStore } from '../../stores';
import {
    OfficeLocation,
    Speciality,
    type UserData,
    UserType,
} from '../../types';
import SectionTitle from '../../components/SectionTitle';
import SmartAvatar from '../../components/SmartAvatar';
import {
    validateEmail,
    validateFullName,
    validatePhone,
    validateLicenseID,
    validateAMKA,
    validateFreeFormText,
    validateSelectField,
} from '../../utils/validation';
import {
    sanitizeEmail,
    sanitizeName,
    sanitizePhoneNumber,
    sanitizeAlphanumeric,
    sanitizeNumber,
    sanitizeTextarea,
} from '../../utils/sanitization';

interface ProfileFormErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    licenceID?: string;
    officeLocation?: string;
    amka?: string;
    bio?: string;
    speciality?: string;
}

export default observer(function Profile() {
    const formRef = useRef<HTMLFormElement>(null);
    const [errors, setErrors] = useState<ProfileFormErrors>({});
    const [fullName, setFullName] = useState(userStore.fullName || '');
    const [email, setEmail] = useState(userStore.email || '');
    const [phone, setPhone] = useState(userStore.phone || '');
    const [licenceID, setLicenceID] = useState(userStore.licenceID || '');
    const [officeLocation, setOfficeLocation] = useState(userStore.officeLocation || '');
    const [speciality, setSpeciality] = useState(userStore.speciality || '');
    const [amka, setAmka] = useState(userStore.amka || '');
    const [bio, setBio] = useState(userStore.bio || '');

    const validateProfileForm = (data: Record<string, any>): boolean => {
        const newErrors: ProfileFormErrors = {};

        const nameValidation = validateFullName(data.fullName || '');
        if (!nameValidation.isValid) {
            newErrors.fullName = nameValidation.error;
        }

        const emailValidation = validateEmail(data.email || '');
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.error;
        }

        const phoneValidation = validatePhone(data.phone || '');
        if (!phoneValidation.isValid) {
            newErrors.phone = phoneValidation.error;
        }

        // Doctor
        if (userStore.userType === UserType.Doctor) {
            const licenseValidation = validateLicenseID(data.licenceID || '');
            if (!licenseValidation.isValid) {
                newErrors.licenceID = licenseValidation.error;
            }

            const bioValidation = validateFreeFormText(data.bio || '', 0, 1000, false, 'Bio');
            if (!bioValidation.isValid) {
                newErrors.bio = bioValidation.error;
            }

            const locationValidation = validateSelectField(
                data.officeLocation || '',
            );
            if (!locationValidation.isValid) {
                newErrors.officeLocation = locationValidation.error;
            }
        }

        // Patient
        if (userStore.userType === UserType.Patient) {
            const amkaValidation = validateAMKA(data.amka || '');
            if (!amkaValidation.isValid) {
                newErrors.amka = amkaValidation.error;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = {
            fullName,
            email,
            phone,
            licenceID,
            officeLocation,
            speciality,
            amka,
            bio,
        };

        if (!validateProfileForm(data)) {
            return;
        }

        const sanitizedData: Partial<UserData> = {
            fullName: sanitizeName(fullName),
            email: sanitizeEmail(email),
            phone: sanitizePhoneNumber(phone),
            amka: amka ? sanitizeNumber(amka) : undefined,
        };

        // Only include doctor-specific fields if user is a doctor
        if (userStore.userType === UserType.Doctor) {
            sanitizedData.licenceID = licenceID ? sanitizeAlphanumeric(licenceID) : undefined;
            sanitizedData.bio = bio ? sanitizeTextarea(bio) : undefined;
            sanitizedData.officeLocation = officeLocation as OfficeLocation;
            sanitizedData.speciality = speciality as Speciality;
        }

        await userStore.updateUserData(sanitizedData as UserData);
    };

    useEffect(() => {
        const fetchData = async () => {
            await userStore.getAvatar();
        };
        fetchData();
    }, []);
    return (
        <Box sx={{ flex: 1, width: '100%' }}>
            <Box
                sx={{
                    position: 'sticky',
                    top: { sm: -100, md: -110 },
                    bgcolor: 'background.body',
                    zIndex: 9995,
                }}
            >
                <SectionTitle title="My Profile" subtitle="View your profile details" />
            </Box>
            <Stack
                spacing={4}
                sx={{
                    display: 'flex',
                    maxWidth: '800px',
                    mx: 'auto',
                    px: { xs: 2, md: 6 },
                    py: { xs: 6, md: 3 },
                }}
            >
                <Card sx={{ minWidth: 620 }}>
                    <Box sx={{ mb: 1 }}>
                        <Typography level='title-md'>Personal info</Typography>
                        <Typography level='body-sm'>
                            Customize your profile information.
                        </Typography>
                    </Box>
                    <Divider />
                    <Stack direction='row' spacing={3}>
                        <Stack direction='column' spacing={1}>
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                <SmartAvatar
                                    src={userStore.avatarData}
                                    name={userStore.fullName}
                                    size='lg'
                                    sx={{
                                        width: 200,
                                        height: 200,
                                        fontSize: '3rem'
                                    }}
                                />
                                <IconButton
                                    aria-label='upload new picture'
                                    size='sm'
                                    variant='outlined'
                                    component='label'
                                    color='neutral'
                                    sx={{
                                        bgcolor: 'background.body',
                                        position: 'absolute',
                                        zIndex: 2,
                                        borderRadius: '50%',
                                        right: 10,
                                        bottom: 10,
                                        boxShadow: 'sm',
                                    }}
                                >
                                    <EditRoundedIcon />
                                    <input
                                        type='file'
                                        accept='image/*'
                                        style={{
                                            display: 'none',
                                            height: '20px',
                                            width: '30px',
                                        }}
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = async () => {
                                                    await userStore.updateAvatar(
                                                        reader.result as string,
                                                    );
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </IconButton>
                            </Box>
                        </Stack>
                        <Stack spacing={2} sx={{ flex: 1 }}>
                            <form
                                onSubmit={submitHandler}
                                ref={formRef}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 16,
                                }}
                            >
                                <Stack spacing={1}>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl
                                        sx={{
                                            display: {
                                                sm: 'flex-column',
                                                md: 'flex-row',
                                            },
                                            gap: 2,
                                        }}
                                        error={!!errors.fullName}
                                    >
                                        <Input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                            size='sm'
                                            placeholder='Full name'
                                            name='fullName'
                                        />
                                        {errors.fullName && (
                                            <FormHelperText>
                                                {errors.fullName}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Stack>
                                <Stack direction='row' spacing={2}>
                                    <FormControl sx={{ flex: 1 }} error={!!errors.email}>
                                        <FormLabel>Email</FormLabel>
                                        <Input
                                            size='sm'
                                            type='email'
                                            startDecorator={
                                                <EmailRoundedIcon />
                                            }
                                            placeholder='email'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            sx={{ flex: 1 }}
                                            name='email'
                                        />
                                        {errors.email && (
                                            <FormHelperText>
                                                {errors.email}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                    <FormControl sx={{ flex: 1 }} error={!!errors.phone}>
                                        <FormLabel>Phone</FormLabel>
                                        <Input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            startDecorator={<Phone />}
                                            size='sm'
                                            name='phone'
                                            placeholder='Phone'
                                        />
                                        {errors.phone && (
                                            <FormHelperText>
                                                {errors.phone}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Stack>
                                {userStore.userType === UserType.Doctor ? (
                                    <>
                                        <Stack direction='row' spacing={2}>
                                            <FormControl sx={{ flex: 1 }} error={!!errors.speciality}>
                                                <FormLabel>
                                                    Speciality
                                                </FormLabel>
                                                <Select
                                                    required
                                                    size='sm'
                                                    placeholder='Speciality'
                                                    value={speciality}
                                                    onChange={(_, newValue) => setSpeciality(newValue || '')}
                                                    name='speciality'
                                                    startDecorator={
                                                        <MedicalServicesIcon />
                                                    }
                                                >
                                                    {Object.keys(
                                                        Speciality,
                                                    ).map((key) => (
                                                        <Option
                                                            key={key}
                                                            value={
                                                                Speciality[
                                                                key as keyof typeof Speciality
                                                                ]
                                                            }
                                                        >
                                                            {key}
                                                        </Option>
                                                    ))}
                                                </Select>
                                                {errors.speciality && (
                                                    <FormHelperText>
                                                        {errors.speciality}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                            <FormControl sx={{ flex: 1 }} error={!!errors.licenceID}>
                                                <FormLabel>
                                                    License ID
                                                </FormLabel>
                                                <Input
                                                    value={licenceID}
                                                    onChange={(e) => setLicenceID(e.target.value)}
                                                    required
                                                    startDecorator={
                                                        <NumbersIcon />
                                                    }
                                                    size='sm'
                                                    name='licenceID'
                                                    placeholder='License ID'
                                                />
                                                {errors.licenceID && (
                                                    <FormHelperText>
                                                        {errors.licenceID}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                        </Stack>
                                        <Stack direction='row' spacing={2}>
                                            <FormControl sx={{ flex: 1 }} error={!!errors.officeLocation}>
                                                <FormLabel>
                                                    Office Location
                                                </FormLabel>
                                                <Select
                                                    required
                                                    size='sm'
                                                    placeholder='Office Location'
                                                    name='officeLocation'
                                                    startDecorator={
                                                        <PinDropRounded />
                                                    }
                                                    value={officeLocation}
                                                    onChange={(_, newValue) => setOfficeLocation(newValue || '')}
                                                >
                                                    {Object.keys(
                                                        OfficeLocation,
                                                    ).map((key) => (
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
                                                    ))}
                                                </Select>
                                                {errors.officeLocation && (
                                                    <FormHelperText>
                                                        {errors.officeLocation}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                            <FormControl sx={{ flex: 1 }} error={!!errors.bio}>
                                                <FormLabel>Bio</FormLabel>
                                                <Textarea
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    size='sm'
                                                    name='bio'
                                                    placeholder='Bio'
                                                    minRows={3}
                                                />
                                                {errors.bio && (
                                                    <FormHelperText>
                                                        {errors.bio}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                        </Stack>
                                    </>
                                ) : (
                                    <Stack direction='row' spacing={2}>
                                        <FormControl sx={{ flex: 1 }} error={!!errors.amka}>
                                            <FormLabel>AMKA</FormLabel>
                                            <Input
                                                value={amka}
                                                onChange={(e) => setAmka(e.target.value)}
                                                startDecorator={<NumbersIcon />}
                                                size='sm'
                                                name='amka'
                                                placeholder='AMKA'
                                            />
                                            {errors.amka && (
                                                <FormHelperText>
                                                    {errors.amka}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Stack>
                                )}
                            </form>
                        </Stack>
                    </Stack>
                    <CardOverflow
                        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                    >
                        <CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
                            <Button
                                size='sm'
                                variant='outlined'
                                color='neutral'
                            >
                                Cancel
                            </Button>
                            <Button
                                loading={userStore.isLoading}
                                size='sm'
                                variant='solid'
                                onClick={() => formRef.current?.requestSubmit()}
                            >
                                Save
                            </Button>
                        </CardActions>
                    </CardOverflow>
                </Card>
            </Stack>
        </Box>
    );
});
