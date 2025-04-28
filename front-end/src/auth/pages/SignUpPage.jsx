import { useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, TextField, Button, Link, Alert, InputAdornment, IconButton, Typography, Select, MenuItem } from "@mui/material";
import { Visibility, VisibilityOff, Email, Person, CalendarToday, Wc } from '@mui/icons-material';
import { AuthLayout } from "../layout/AuthLayout";
import { useForm } from "../../hooks/useForm";
import { useAuthStore } from '../../hooks/useAuthStore';
import Swal from 'sweetalert2';

const formData = {
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    email: '',
    password: '',
    password2: ''
}

const formValidations = {
    firstName: [(value) => value.length >= 1, 'First name is required'],
    lastName: [(value) => value.length >= 1, 'Last name is required'],
    birthDate: [(value) => value.length >= 1, 'Birth date is required'],
    gender: [(value) => value.length >= 1, 'Gender is required'],
    email: [(value) => value.includes('@'), 'Please enter a valid email'],
    password: [(value) => value.length >= 8, 'Password must be at least 8 characters'],
    password2: [(value) => value.length >= 1, 'Please confirm your password']
}

export const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    const { status, errorMessage, startSignUp } = useAuthStore();
    const { formState, firstName, lastName, email, password, password2, birthDate, gender, onInputChange,
            isFormValid, firstNameValid, lastNameValid, emailValid, passwordValid, password2Valid, birthDateValid, genderValid } = useForm(formData, formValidations);

    const isAuthenticating = useMemo(() => status === 'checking', [status]);

    const onSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);

        if (!isFormValid) return;

        if (password !== password2) {
            Swal.fire('Password Error', 'The passwords do not match', 'error');
            return;
        }

        startSignUp({ firstName, lastName, email, password, birthDate, gender });
    }

    return (
        <AuthLayout title="">
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                    Create Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Join ShootIt to start sharing your photos
                </Typography>
            </Box>

            <form onSubmit={onSubmit} className="animate__animated animate__fadeIn animate__faster">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="First Name"
                            type="text"
                            placeholder="John"
                            fullWidth
                            name="firstName"
                            value={firstName}
                            onChange={onInputChange}
                            error={!!firstNameValid && formSubmitted}
                            helperText={formSubmitted && firstNameValid}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            label="Last Name"
                            type="text"
                            placeholder="Doe"
                            fullWidth
                            name="lastName"
                            value={lastName}
                            onChange={onInputChange}
                            error={!!lastNameValid && formSubmitted}
                            helperText={formSubmitted && lastNameValid}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Box>

                    <TextField
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        fullWidth
                        name="email"
                        value={email}
                        onChange={onInputChange}
                        error={!!emailValid && formSubmitted}
                        helperText={formSubmitted && emailValid}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        fullWidth
                        name="password"
                        value={password}
                        onChange={onInputChange}
                        error={!!passwordValid && formSubmitted}
                        helperText={formSubmitted && passwordValid}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <TextField
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        fullWidth
                        name="password2"
                        value={password2}
                        onChange={onInputChange}
                        error={!!password2Valid && formSubmitted}
                        helperText={formSubmitted && password2Valid}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Birth Date"
                            type="date"
                            fullWidth
                            name="birthDate"
                            value={birthDate}
                            onChange={onInputChange}
                            error={!!birthDateValid && formSubmitted}
                            helperText={formSubmitted && birthDateValid}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarToday sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            select
                            label="Gender"
                            fullWidth
                            name="gender"
                            value={gender}
                            onChange={onInputChange}
                            error={!!genderValid && formSubmitted}
                            helperText={formSubmitted && genderValid}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Wc sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        >
                            <MenuItem value="M">Male</MenuItem>
                            <MenuItem value="F">Female</MenuItem>
                        </TextField>
                    </Box>

                    {errorMessage && (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        size="large"
                        disabled={isAuthenticating}
                        sx={{
                            mt: 1,
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: 2,
                        }}
                    >
                        Create Account
                    </Button>

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        <Typography color="text.secondary">
                            Already have an account?
                        </Typography>
                        <Link
                            component={RouterLink}
                            to="/auth/login"
                            sx={{
                                color: 'primary.main',
                                textDecoration: 'none',
                                fontWeight: 500,
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Sign in
                        </Link>
                    </Box>
                </Box>
            </form>
        </AuthLayout>
    );
};
