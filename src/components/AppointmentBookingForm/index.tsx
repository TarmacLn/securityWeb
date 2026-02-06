import { Box, Divider, Textarea, Typography, Card, CardActions, CardOverflow, Stack, FormHelperText } from "@mui/joy";
import CheckIcon from '@mui/icons-material/Check';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useDoctorAvailability } from "../../hooks/availability";
import { LowercaseType } from '../../hooks/lowercase';
import { Availability } from '../../types';
import { validateFreeFormText } from "../../utils/validation";
import { sanitizeTextarea, limitLength } from "../../utils/sanitization";

const MAX_REASON_LENGTH = 500;

interface AppointmentBookingFormProps {
    doctorId: string;
    reason: string;
    setReason: (reason: string) => void;
    selectedSlot: number | null;
    setSelectedSlot: (slot: number | null) => void;
    actions?: React.ReactNode;
    reasonError?: string;
    setReasonError?: (error: string) => void;
}

export default function AppointmentBookingForm({
    doctorId,
    reason,
    setReason,
    selectedSlot,
    setSelectedSlot,
    actions,
    reasonError = '',
    setReasonError,
}: AppointmentBookingFormProps) {
    const { availabilities } = useDoctorAvailability(doctorId);

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const limitedValue = limitLength(value, MAX_REASON_LENGTH);
        setReason(limitedValue);
        
        if (reasonError && setReasonError) {
            setReasonError('');
        }
    };

    const validateReasonField = (): boolean => {
        const validation = validateFreeFormText(reason, 0, MAX_REASON_LENGTH, false, 'Reason');
        if (!validation.isValid && setReasonError) {
            setReasonError(validation.error || '');
            return false;
        }
        return true;
    };

    const getSanitizedReason = (): string => {
        return sanitizeTextarea(reason);
    };

    // Expose validation and sanitization to parent if needed
    (AppointmentBookingForm as any).validateReason = validateReasonField;
    (AppointmentBookingForm as any).getSanitizedReason = getSanitizedReason;

    return (
        <>
            <Card>
                <Box sx={{ mb: 0.5 }}>
                    <Typography level="title-md">Reason</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    <Typography level="body-sm">Reason for Appointment</Typography>
                    <Textarea
                        minRows={3}
                        placeholder="Enter the reason for your appointment (optional)"
                        value={reason}
                        onChange={handleReasonChange}
                    />
                    <FormHelperText
                        sx={{
                            mt: 0.75,
                            fontSize: 'xs',
                            color: reasonError ? 'danger.500' : 'inherit',
                        }}
                    >
                        {reasonError || `${MAX_REASON_LENGTH - reason.length} characters remaining`}
                    </FormHelperText>
                </Box>
            </Card>
            <Card>
                <Box sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <CalendarTodayIcon sx={{ color: 'primary.500', fontSize: '1.2rem' }} />
                        <Typography level="title-md">Available Appointments</Typography>
                    </Stack>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        Select your preferred appointment time from the available slots below
                    </Typography>
                </Box>
                <Divider />
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    mb: 1,
                    ml: 0.5,
                    height: '300px',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    p: 1,
                }}
                >
                    {!availabilities || availabilities.length === 0 ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '200px',
                            color: 'text.secondary'
                        }}>
                            <CalendarTodayIcon sx={{ fontSize: '3rem', mb: 2, opacity: 0.3 }} />
                            <Typography level="body-lg" sx={{ mb: 1 }}>No appointments available</Typography>
                            <Typography level="body-sm">Please check back later or contact the doctor directly</Typography>
                        </Box>
                    ) : (
                        <Box
                            role="group"
                            aria-labelledby="available-time-slot"
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: 2,
                                width: '100%'
                            }}
                        >
                        {availabilities?.map((availability: LowercaseType<Availability>) => {
                            const dateObj = new Date(availability.timefrom);
                            const formattedDate = dateObj.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            });
                            const formattedTime = dateObj.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            });

                            const checked = selectedSlot === availability.availabilityid;
                            return (
                                <Card
                                    key={availability.availabilityid}
                                    variant={checked ? 'solid' : 'outlined'}
                                    color={checked ? 'primary' : 'neutral'}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        minHeight: '90px',
                                        background: checked
                                            ? 'linear-gradient(135deg, var(--joy-palette-primary-500) 0%, var(--joy-palette-primary-600) 100%)'
                                            : 'var(--joy-palette-background-surface)',
                                        border: checked
                                            ? '2px solid var(--joy-palette-primary-400)'
                                            : '2px solid var(--joy-palette-neutral-300)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: checked
                                                ? '0 8px 25px rgba(var(--joy-palette-primary-mainChannel), 0.25)'
                                                : '0 8px 25px rgba(0, 0, 0, 0.1)',
                                            border: checked
                                                ? '2px solid var(--joy-palette-primary-300)'
                                                : '2px solid var(--joy-palette-primary-400)',
                                        },
                                        position: 'relative',
                                        overflow: 'visible'
                                    }}
                                    onClick={() => {
                                        setSelectedSlot(checked ? null : availability.availabilityid);
                                    }}
                                >
                                    {checked && (
                                        <CheckIcon
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                fontSize: '1.4rem',
                                                color: 'white',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                borderRadius: '50%',
                                                p: 0.3,
                                                animation: 'fadeIn 0.3s ease-in-out',
                                                '@keyframes fadeIn': {
                                                    '0%': { opacity: 0, transform: 'scale(0.5)' },
                                                    '100%': { opacity: 1, transform: 'scale(1)' }
                                                }
                                            }}
                                        />
                                    )}
                                    <Stack spacing={1.5} alignItems="center" py={1.5}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <CalendarTodayIcon
                                                sx={{
                                                    fontSize: '1.1rem',
                                                    color: checked ? 'rgba(255, 255, 255, 0.9)' : 'primary.500'
                                                }}
                                            />
                                            <Typography
                                                level="title-sm"
                                                sx={{
                                                    color: checked ? 'white' : 'text.primary',
                                                    fontWeight: 600,
                                                    fontSize: '0.95rem'
                                                }}
                                            >
                                                {formattedDate}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <AccessTimeIcon
                                                sx={{
                                                    fontSize: '1.1rem',
                                                    color: checked ? 'rgba(255, 255, 255, 0.8)' : 'primary.400'
                                                }}
                                            />
                                            <Typography
                                                level="body-md"
                                                sx={{
                                                    color: checked ? 'rgba(255, 255, 255, 0.95)' : 'text.secondary',
                                                    fontWeight: 500,
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {formattedTime}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Card>
                            );
                        })}
                        </Box>
                    )}
                </Box>
                {actions && (
                    <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                        <CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
                            {actions}
                        </CardActions>
                    </CardOverflow>
                )}
            </Card>
        </>
    );
}
