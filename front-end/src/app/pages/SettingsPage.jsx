import { useState, useEffect } from "react";
import { useAuthStore } from "../../hooks/useAuthStore";
import { useForm } from "../../hooks/useForm";
import { Box, Card, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Alert, IconButton, InputAdornment } from "@mui/material";
import { Person, Email, Lock, CalendarToday, Wc, Visibility, VisibilityOff } from '@mui/icons-material';
import Swal from 'sweetalert2';

const userFormFields = {
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    gender: '',
};

const passwordFormFields = {
    oldPassword: '',
    newPassword: '',
    newPassword2: '',
};

const formValidationsUser = {
    firstName: [(value) => value.length >= 1, 'First name is required'],
    lastName: [(value) => value.length >= 1, 'Last name is required'],
    birthDate: [(value) => value.length >= 1, 'Birth date is required'],
    gender: [(value) => value.length >= 1, 'Gender is required'],
    email: [(value) => value.includes('@'), 'Please enter a valid email'],
};

const formValidationsPassword = {
    oldPassword: [(value) => value.length >= 1, 'Current password is required'],
    newPassword: [(value) => value.length >= 8, 'Password must be at least 8 characters'],
    newPassword2: [(value) => value.length >= 1, 'Please confirm your new password'],
};

export const SettingsPage = () => {
    const { user, startUpdatingUser, startUpdatingPassword } = useAuthStore();
    const [formSubmitted1, setFormSubmitted1] = useState(false);
    const [formSubmitted2, setFormSubmitted2] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        formState: formStateUser,
        firstName,
        lastName,
        email,
        birthDate,
        gender,
        onInputChange: onUserInputChange,
        isFormValid: isFormValidUser,
        firstNameValid,
        lastNameValid,
        emailValid,
        birthDateValid,
        genderValid,
        setFormState
    } = useForm(userFormFields, formValidationsUser);

    const {
        formState: formStatePassword,
        oldPassword,
        newPassword,
        newPassword2,
        onInputChange: onPasswordInputChange,
        isFormValid: isFormValidPassword,
        oldPasswordValid,
        newPasswordValid,
        newPassword2Valid,
        onResetForm
    } = useForm(passwordFormFields, formValidationsPassword);

    useEffect(() => {
        setFormState({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            birthDate: user.birthDate?.substring(0, 10) || '',
            gender: user.gender,
        });
    }, []);

    const onSubmitUser = (e) => {
        e.preventDefault();
        setFormSubmitted1(true);

        if (!isFormValidUser) return;

        startUpdatingUser({ firstName, lastName, email, birthDate, gender });
    };

    const onSubmitPassword = async (e) => {
        e.preventDefault();
        setFormSubmitted2(true);

        if (!isFormValidPassword) return;

        if (newPassword !== newPassword2) {
            Swal.fire('Error', 'The passwords do not match', 'error');
            return;
        }

        const result = await startUpdatingPassword(oldPassword, newPassword);
        if (result) {
            onResetForm();
            setFormSubmitted2(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                    Account Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your profile and security settings
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Profile Information */}
                <Card className="p-6">
                    <Typography variant="h6" gutterBottom className="flex items-center gap-2 mb-4">
                        <Person className="text-indigo-600" />
                        Profile Information
                    </Typography>

                    <form onSubmit={onSubmitUser} className="animate__animated animate__fadeIn animate__faster">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="First Name"
                                    fullWidth
                                    name="firstName"
                                    value={firstName}
                                    onChange={onUserInputChange}
                                    error={!!firstNameValid && formSubmitted1}
                                    helperText={formSubmitted1 && firstNameValid}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                                <TextField
                                    label="Last Name"
                                    fullWidth
                                    name="lastName"
                                    value={lastName}
                                    onChange={onUserInputChange}
                                    error={!!lastNameValid && formSubmitted1}
                                    helperText={formSubmitted1 && lastNameValid}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Box>

                            <TextField
                                label="Email"
                                fullWidth
                                name="email"
                                value={email}
                                onChange={onUserInputChange}
                                error={!!emailValid && formSubmitted1}
                                helperText={formSubmitted1 && emailValid}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Birth Date"
                                    type="date"
                                    fullWidth
                                    name="birthDate"
                                    value={birthDate}
                                    onChange={onUserInputChange}
                                    error={!!birthDateValid && formSubmitted1}
                                    helperText={formSubmitted1 && birthDateValid}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarToday sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <FormControl fullWidth size="small" error={!!genderValid && formSubmitted1}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        value={gender}
                                        label="Gender"
                                        name="gender"
                                        onChange={onUserInputChange}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Wc sx={{ color: 'text.secondary', ml: 1 }} />
                                            </InputAdornment>
                                        }
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    >
                                        <MenuItem value="M">Male</MenuItem>
                                        <MenuItem value="F">Female</MenuItem>
                                    </Select>
                                    {formSubmitted1 && genderValid && (
                                        <FormHelperText>{genderValid}</FormHelperText>
                                    )}
                                </FormControl>
                            </Box>

                            <Button
                                variant="contained"
                                type="submit"
                                size="large"
                                sx={{
                                    mt: 1,
                                    py: 1.5,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </form>
                </Card>

                {/* Password Settings */}
                <Card className="p-6">
                    <Typography variant="h6" gutterBottom className="flex items-center gap-2 mb-4">
                        <Lock className="text-indigo-600" />
                        Change Password
                    </Typography>

                    <form onSubmit={onSubmitPassword} className="animate__animated animate__fadeIn animate__faster">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                label="Current Password"
                                type={showOldPassword ? 'text' : 'password'}
                                fullWidth
                                name="oldPassword"
                                value={oldPassword}
                                onChange={onPasswordInputChange}
                                error={!!oldPasswordValid && formSubmitted2}
                                helperText={formSubmitted2 && oldPasswordValid}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowOldPassword(!showOldPassword)}
                                                edge="end"
                                            >
                                                {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <TextField
                                label="New Password"
                                type={showNewPassword ? 'text' : 'password'}
                                fullWidth
                                name="newPassword"
                                value={newPassword}
                                onChange={onPasswordInputChange}
                                error={!!newPasswordValid && formSubmitted2}
                                helperText={formSubmitted2 && newPasswordValid}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                edge="end"
                                            >
                                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <TextField
                                label="Confirm New Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                fullWidth
                                name="newPassword2"
                                value={newPassword2}
                                onChange={onPasswordInputChange}
                                error={!!newPassword2Valid && formSubmitted2}
                                helperText={formSubmitted2 && newPassword2Valid}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <Button
                                variant="contained"
                                type="submit"
                                size="large"
                                sx={{
                                    mt: 1,
                                    py: 1.5,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                }}
                            >
                                Update Password
                            </Button>
                        </Box>
                    </form>
                </Card>
            </Box>
        </div>
    );
};
