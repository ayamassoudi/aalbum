import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useForm } from '../../hooks/useForm';
import { Link as RouterLink } from 'react-router-dom';
import { Grid, TextField, Button, Link, Alert, InputAdornment, IconButton, Box, Typography } from "@mui/material";
import { Visibility, VisibilityOff, Email } from '@mui/icons-material';
import { AuthLayout } from '../layout/AuthLayout';

const loginFormFields = {
    loginEmail: '',
    loginPassword: '',
}

export const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { startLogin, errorMessage } = useAuthStore();
    const { loginEmail, loginPassword, onInputChange: onLoginInputChange } = useForm(loginFormFields);

    const onSubmit = (e) => {
        e.preventDefault();
        startLogin({ email: loginEmail, password: loginPassword });
    }

    useEffect(() => {
        if (errorMessage !== undefined) {
            Swal.fire('Authentication Error', errorMessage, 'error');
        }
    }, [errorMessage]);

    return (
        <AuthLayout title="">
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                    Welcome back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Sign in to access your photos
                </Typography>
            </Box>

            <form onSubmit={onSubmit} className="animate__animated animate__fadeIn animate__faster">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        fullWidth
                        name="loginEmail"
                        value={loginEmail}
                        onChange={onLoginInputChange}
                        variant="outlined"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />

                    <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Your password"
                        fullWidth
                        name="loginPassword"
                        value={loginPassword}
                        onChange={onLoginInputChange}
                        variant="outlined"
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
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />

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
                        sx={{
                            mt: 1,
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: 2,
                        }}
                    >
                        Sign In
                    </Button>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Link
                            component={RouterLink}
                            to="/auth/forgot-password"
                            sx={{
                                color: 'text.secondary',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Forgot password?
                        </Link>

                        <Link
                            component={RouterLink}
                            to="/auth/signup"
                            sx={{
                                color: 'primary.main',
                                textDecoration: 'none',
                                fontWeight: 500,
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Create an account
                        </Link>
                    </Box>
                </Box>
            </form>
        </AuthLayout>
    );
};