import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {


  if (req.url.includes('usajobs.gov')) {
    const modifiedReq = req.clone({
      setHeaders: {
        'User-Agent': environment.usajobs.userAgent,
        'Authorization-Key': environment.usajobs.apiKey,
      },
    });
    return next(modifiedReq);
  }
  return next(req);
};