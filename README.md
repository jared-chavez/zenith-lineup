# Zenith Lineup - Healthy Habits Tracker

A secure, modern application for tracking healthy habits like water intake, sleep, and exercise, built with Laravel PHP, React.js, and MySQL.

## 🛡️ Security Features

This application follows the **Secure Software Development Lifecycle (S-SDLC)** methodology and implements comprehensive security measures:

- **Authentication & Authorization**: Laravel Sanctum with token-based auth
- **Input Validation**: Server-side validation with Laravel Validator
- **SQL Injection Prevention**: Eloquent ORM with prepared statements
- **XSS Protection**: Content Security Policy (CSP) headers
- **Rate Limiting**: Prevents brute force attacks
- **Security Headers**: Comprehensive HTTP security headers
- **CORS Protection**: Configured for secure cross-origin requests
- **Audit Logging**: Complete security event logging

## 🚀 Quick Start

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL 8.0+
- Hostinger hosting environment

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/zenith-lineup.git
   cd zenith-lineup
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure database in `.env`**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=zenith_lineup
   DB_USERNAME=your_username
   DB_PASSWORD=your_secure_password
   
   # Security settings
   SESSION_SECURE_COOKIE=true
   SESSION_HTTP_ONLY=true
   SESSION_SAME_SITE=strict
   
   # CORS settings
   FRONTEND_URL=http://localhost:3000
   ```

6. **Run database migrations**
   ```bash
   php artisan migrate
   ```

7. **Seed the database (optional)**
   ```bash
   php artisan db:seed
   ```

8. **Build frontend assets**
   ```bash
   npm run build
   ```

9. **Start the development server**
   ```bash
   # Terminal 1: Laravel backend
   php artisan serve
   
   # Terminal 2: React frontend
   npm run dev
   ```

## 🔧 Configuration for Hostinger

### 1. Upload to Hostinger
- Upload all files to your Hostinger hosting directory
- Ensure `.env` file is properly configured with production settings

### 2. Database Setup
- Create MySQL database in Hostinger control panel
- Update `.env` with Hostinger database credentials

### 3. SSL Configuration
- Enable SSL certificate in Hostinger
- Update `APP_URL` in `.env` to use HTTPS
- Configure HSTS headers for production

### 4. File Permissions
```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chmod 644 .env
```

## 📁 Project Structure

```
zenith-lineup/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/     # API controllers
│   │   └── Middleware/          # Security middleware
│   └── Models/                  # Eloquent models
├── database/
│   ├── migrations/              # Database migrations
│   └── seeders/                 # Database seeders
├── resources/
│   ├── js/                      # React.js frontend
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   └── stores/              # State management
│   └── views/                   # Blade templates
├── routes/
│   └── api.php                  # API routes
└── config/                      # Configuration files
```

## 🔐 Security Implementation

### Authentication Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Laravel Sanctum generates secure token
3. Token used for subsequent API requests
4. Rate limiting prevents brute force attacks

### API Security
- All endpoints validate user ownership
- Input sanitization prevents XSS and injection attacks
- CORS configured for secure cross-origin requests
- Comprehensive logging of security events

### Database Security
- Eloquent ORM prevents SQL injection
- Row-level security through user ownership
- Sensitive data encrypted at rest
- Audit logging for all data operations

## 🧪 Testing

### Security Testing
```bash
# Run security tests
php artisan test --filter=Security

# Check for vulnerabilities
composer audit

# Run PHPStan for code quality
./vendor/bin/phpstan analyse
```

### API Testing
```bash
# Test authentication endpoints
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"SecurePass123!","password_confirmation":"SecurePass123!"}'
```

## 📊 Features

### Core Functionality
- **User Authentication**: Secure registration and login
- **Habit Tracking**: Track water, sleep, exercise, nutrition, meditation
- **Progress Analytics**: Visual progress tracking and statistics
- **Reminders**: Customizable habit reminders
- **Profile Management**: User profile with health metrics

### Security Features
- **Multi-factor Authentication**: Ready for 2FA implementation
- **Session Management**: Secure session handling
- **Data Privacy**: GDPR compliant data handling
- **Audit Trail**: Complete activity logging

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Habits
- `GET /api/habits` - List user habits
- `POST /api/habits` - Create new habit
- `GET /api/habits/{id}` - Get specific habit
- `PUT /api/habits/{id}` - Update habit
- `DELETE /api/habits/{id}` - Delete habit
- `GET /api/habits/{id}/stats` - Get habit statistics

### Habit Logs
- `GET /api/habit-logs` - List habit logs
- `POST /api/habit-logs` - Create habit log
- `GET /api/habit-logs/date/{date}` - Get logs by date
- `GET /api/habit-logs/range/{start}/{end}` - Get logs by date range

## 🛠️ Development

### Adding New Features
1. Create migration for database changes
2. Update models with relationships and validation
3. Create API controller with security measures
4. Add routes to `routes/api.php`
5. Create React components for frontend
6. Add tests for security and functionality

### Security Checklist
- [ ] Input validation implemented
- [ ] User authorization checked
- [ ] SQL injection prevention verified
- [ ] XSS protection in place
- [ ] Security headers configured
- [ ] Audit logging added
- [ ] Rate limiting applied

## 📈 Monitoring

### Security Monitoring
- Authentication attempts logged
- Rate limit violations tracked
- Suspicious patterns detected
- Error conditions monitored

### Performance Monitoring
- API response times tracked
- Database query performance
- Frontend load times
- Error rates monitored

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow security coding practices
4. Add tests for new features
5. Submit a pull request

### Security Guidelines
- All code must pass security review
- Follow OWASP Top 10 guidelines
- Implement proper input validation
- Add comprehensive logging
- Test for common vulnerabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.zenith-lineup.com](https://docs.zenith-lineup.com)
- **Security Issues**: security@zenith-lineup.com
- **General Support**: support@zenith-lineup.com

## 🔗 Links

- [Security Documentation](SECURITY.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guidelines](CONTRIBUTING.md)
