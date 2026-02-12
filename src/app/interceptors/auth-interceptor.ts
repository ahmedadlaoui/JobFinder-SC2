import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    if (req.url.startsWith(environment.jsonServerUrl) && authService.currentUser) {
        const modifiedReq = req.clone({
            setHeaders: {
                'X-User-Id': authService.currentUser.id.toString(),
                'X-User-Email': authService.currentUser.email,
            },
        });
        return next(modifiedReq);
    }

    return next(req);
};
