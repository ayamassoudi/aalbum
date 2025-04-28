import { Box, Container, Paper, Typography } from "@mui/material"
import logo from '../../favicon.svg'
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';

export const AuthLayout = ({ children, title = '' }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CameraEnhanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  letterSpacing: '-0.5px'
                }}
              >
                Shoot It
              </Typography>
            </Box>
            {title && (
              <Typography variant="h6" color="text.secondary" fontWeight="500">
                {title}
              </Typography>
            )}
          </Box>

          <Paper
            elevation={0}
            sx={{
              width: '100%',
              p: 4,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {children}
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
            By using Shoot It, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
